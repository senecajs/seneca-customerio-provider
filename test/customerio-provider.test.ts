/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'
import * as Http from 'http'

const { RegionEU } = require("customerio-node")


const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import CustomerioProvider from '../src/customerio-provider'
import CustomerioProviderDoc from '../src/CustomerioProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Live tests call the Customer.io Track API. They need real credentials:
// test/local-env.js (see local-env-template.js), or the environment
// variables CUSTOMERIO_SITEID and CUSTOMERIO_APIKEY. Without them the same
// tests run against a local mock of the Track API, and the env plugin gets
// dummy values.
const LIVE = Fs.existsSync(__dirname + '/local-env.js') ||
  (!!process.env.CUSTOMERIO_SITEID && !!process.env.CUSTOMERIO_APIKEY)

if (!LIVE) {
  process.env.CUSTOMERIO_SITEID ??= 'test-siteid'
  process.env.CUSTOMERIO_APIKEY ??= 'test-apikey'
}


let mock: MockTrackApi | null = null

beforeAll(async () => {
  if (!LIVE) {
    mock = await makeMockTrackApi()
  }
})

afterAll(async () => {
  if (mock) {
    await mock.close()
  }
})


describe('customerio-provider', () => {

  test('happy', async () => {
    expect(CustomerioProvider).toBeDefined()
    expect(CustomerioProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(await seneca.post('sys:provider,provider:customerio,get:info'))
      .toMatchObject({
        ok: true,
        name: 'customerio',
      })

    await seneca.close()
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
    await seneca.close()
  })


  test('identify-person', async () => {
    const seneca = await makeSeneca()

    let p0 = seneca.entity('provider/customerio/person').data$({
      id: 'p0',
      name: 'Alice',
      email: 'alice@example.com'
    })

    // console.log(p0)

    p0 = await p0.save$()

    expect(p0).toMatchObject({
      'entity$': 'provider/customerio/person',
      id: 'p0',
      name: 'Alice',
      email: 'alice@example.com',
      foo: 111
    })

    if (mock) {
      expect(mock.calls).toContainEqual({
        method: 'PUT',
        url: '/api/v1/customers/p0',
        auth: basicAuth(),
        body: {
          id: 'p0',
          name: 'Alice',
          email: 'alice@example.com',
          foo: 111
        }
      })
    }

    await seneca.close()
  })


  test('track-event', async () => {
    const seneca = await makeSeneca()

    let e0 = await seneca.entity('provider/customerio/event').data$({
      id: 'e0',
      identity: 'p0',
      name: 'signup',
      plan: 'basic',
    }).save$()

    expect(e0).toMatchObject({
      'entity$': 'provider/customerio/event',
      id: 'e0',
      identity: 'p0',
      name: 'signup',
      plan: 'basic',
    })

    if (mock) {
      expect(mock.calls).toContainEqual({
        method: 'POST',
        url: '/api/v1/customers/p0/events',
        auth: basicAuth(),
        body: {
          name: 'signup',
          data: {
            id: 'e0',
            identity: 'p0',
            name: 'signup',
            plan: 'basic',
          }
        }
      })
    }

    await seneca.close()
  })
})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('@seneca/entity')
    .use('@seneca/env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $CUSTOMERIO_SITEID: String,
        $CUSTOMERIO_APIKEY: String,
      }
    })
    .use('@seneca/provider', {
      provider: {
        customerio: {
          keys: {
            siteid: { value: '$CUSTOMERIO_SITEID' },
            apikey: { value: '$CUSTOMERIO_APIKEY' },
          }
        }
      }
    })
    .use(CustomerioProvider, {
      sdkopts: {
        region: RegionEU,

        // The SDK option url replaces the Track API host of the region.
        ...(mock ? { url: mock.url } : {}),
      },
      entity: {
        person: {
          save: {
            foo: 111
          }
        }
      }
    })

  return seneca.ready()
}


function basicAuth() {
  return 'Basic ' + Buffer.from(
    process.env.CUSTOMERIO_SITEID + ':' + process.env.CUSTOMERIO_APIKEY
  ).toString('base64')
}


type MockCall = {
  method?: string
  url?: string
  auth?: string
  body: any
}

type MockTrackApi = {
  url: string
  calls: MockCall[]
  close: () => Promise<void>
}


// A local stand-in for the two Customer.io Track API (v1) calls that the
// plugin makes: identify, PUT /api/v1/customers/{id}, and track,
// POST /api/v1/customers/{id}/events. Both answer 200 with an empty JSON
// object, as the Track API does.
async function makeMockTrackApi(): Promise<MockTrackApi> {
  const calls: MockCall[] = []

  const server = Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => body += chunk)
    req.on('end', () => {
      calls.push({
        method: req.method,
        url: req.url,
        auth: req.headers.authorization,
        body: '' === body ? undefined : JSON.parse(body),
      })

      const path = req.url || ''
      const known =
        ('PUT' === req.method && /^\/api\/v1\/customers\/[^/]+$/.test(path)) ||
        ('POST' === req.method &&
          /^\/api\/v1\/customers\/[^/]+\/events$/.test(path))

      res.writeHead(known ? 200 : 404, { 'Content-Type': 'application/json' })
      res.end(known ? '{}' : JSON.stringify({ meta: { error: 'Not Found' } }))
    })
  })

  await new Promise<void>((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve()))

  const port = (server.address() as { port: number }).port

  return {
    url: `http://127.0.0.1:${port}/api/v1`,
    calls,
    close: () => new Promise<void>((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  }
}
