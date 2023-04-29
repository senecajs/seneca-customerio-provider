/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

// const Fetch = require('node-fetch')


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


  test('list-brand', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/customerio/brand").list$()
    // console.log('BRANDS', list)

    expect(list.length > 0).toBeTruthy()
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
        $CUSTOMERIO_KEY: String,
        $CUSTOMERIO_NAME: String,
        $CUSTOMERIO_CUSTID: String,
        $CUSTOMERIO_ACCID: String,
      }
    })
    .use('provider', {
      provider: {
        customerio: {
          keys: {
            key: { value: '$CUSTOMERIO_KEY' },
            name: { value: '$CUSTOMERIO_NAME' },
            cust: { value: '$CUSTOMERIO_CUSTID' },
            acc: { value: '$CUSTOMERIO_ACCID' },
          }
        }
      }
    })
    .use(CustomerioProvider, {
      // fetch: Fetch,
    })

  return seneca.ready()
}

