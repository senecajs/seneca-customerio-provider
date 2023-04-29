

const { CUSTOMERIO_SITEID, CUSTOMERIO_APIKEY } = require('./local-env')

const { TrackClient, RegionUS, RegionEU } = require("customerio-node");
let cio = new TrackClient(CUSTOMERIO_SITEID, CUSTOMERIO_APIKEY, { region: RegionEU });

async function run() {
  let out = await cio.identify(1, {
    email: 'customer@example.com',
    created_at: 1361205308,
    first_name: 'Bob',
    plan: 'basic',
    stage: 'local',
  });

  out = await cio.identify(1);

  console.log('AAA')
  console.dir(out)

}

run()



