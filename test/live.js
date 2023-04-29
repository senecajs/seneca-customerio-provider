

const Seneca = require('seneca')


Seneca({ legacy: false })
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
  .use('../',{
    entity: {
      person: {
        save: {
          foo: 111
        }
      }
    }
  })
  .ready(async function() {
    const seneca = this

    console.log(await seneca.post('sys:provider,provider:customerio,get:info'))
    
    let p0 = seneca.entity('provider/customerio/person').data$({
      id: 'p0',
      name: 'Alice',
      email: 'alice@example.com'
    })

    // console.log(p0)
    
    p0 = await p0.save$()
    console.log('p0', p0)
  })

