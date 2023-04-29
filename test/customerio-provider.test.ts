/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

const { RegionEU } = require("customerio-node")


const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import CustomerioProvider from '../src/customerio-provider'
import CustomerioProviderDoc from '../src/CustomerioProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Only run some tests locally (not on Github Actions).
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}


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
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
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

  })
})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use('env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $CUSTOMERIO_SITEID: String,
        $CUSTOMERIO_APIKEY: String,
      }
    })
    .use('provider', {
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

