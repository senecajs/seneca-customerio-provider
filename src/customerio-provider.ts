/* Copyright © 2023 Seneca Project Contributors, MIT License. */


const { TrackClient } = require("customerio-node")


const Pkg = require('../package.json')


type CustomerioProviderOptions = {
  entity: Record<string, any>
  sdkopts: Record<string, any>
  debug: boolean
}


function CustomerioProvider(this: any, options: CustomerioProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')

  seneca
    .message('sys:provider,provider:customerio,get:info', get_info)


  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'customerio',
      version: Pkg.version,
    }
  }


  entityBuilder(this, {
    provider: {
      name: 'customerio'
    },
    entity: {
      person: {
        cmd: {
          save: {
            action: async function(this: any, entize: any, msg: any) {
              let data = this.util.deep(
                options.entity.person.save,
                msg.ent.data$(false)
              )


              data.id = null == data.id$ ? data.id : data.id$
              delete data.id$

              if (null == data.id) {
                throw this.error('person.id is required')
              }

              let out = await this.shared.sdk.identify(data.id, data)
              // console.log('OUT', out)

              return entize(data)
            },
          }
        }
      }
    }
  })



  seneca.prepare(async function(this: any) {
    let res =
      await this.post('sys:provider,get:keymap,provider:customerio')

    if (!res.ok) {
      throw this.fail('keymap')
    }

    this.shared.sdk = new TrackClient(
      res.keymap.siteid.value,
      res.keymap.apikey.value,
      options.sdkopts, //       { region: RegionEU }
    );

  })


  return {
    exports: {
    }
  }
}


// Default options.
const defaults: CustomerioProviderOptions = {

  entity: {
    person: {
      save: {
        // Default fields
      }
    }
  },

  sdkopts: {},

  // TODO: Enable debug logging
  debug: false
}


Object.assign(CustomerioProvider, { defaults })

export default CustomerioProvider

if ('undefined' !== typeof (module)) {
  module.exports = CustomerioProvider
}
