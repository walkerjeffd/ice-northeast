const fs = require('fs')
const pgp = require('pg-promise')()

const db = pgp('postgres://jeff@trout.local/sheds')

const dataDirectory = '../../data'

const fetch = (huc12) => {
  console.log('fetch', huc12)
  return db.any(`
      WITH ch AS (
        SELECT featureid, huc12
        FROM data.catchment_huc12
        WHERE huc12=$1::text
      )
      SELECT c.featureid as id, 'Feature' as type, ST_AsGeoJSON(c.geom, 5)::json AS geometry FROM gis.catchments c INNER JOIN ch ON c.featureid=ch.featureid
    `, huc12)
    .then((features) => ({
      id: huc12,
      json: {
        type: 'FeatureCollection',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
          }
        },
        features
      }
    }))
}

const saveFile = (huc) => {
  const huc2 = huc.id.substr(0, 2)
  const filename = `${dataDirectory}/huc12-${huc2}/${huc.id}.json`

  if (!fs.existsSync(`${dataDirectory}/huc12-${huc2}`)) {
    console.log(`creating directory: ${dataDirectory}/huc12-${huc2}/`)
    fs.mkdirSync(`${dataDirectory}/huc12-${huc2}`)
  }

  console.log(`saving ${filename}`)
  fs.writeFileSync(filename, JSON.stringify(huc.json))
  return Promise.resolve(filename)
}

db.any('SELECT DISTINCT huc12 FROM data.catchment_huc12')
  .then(rows => rows.map(d => d.huc12))
  .then((hucs) => {
    return hucs.reduce((promiseChain, huc) => {
      return promiseChain.then(chainResults =>
        fetch(huc)
          .then(saveFile)
          .then(currentResult =>
            [ ...chainResults, currentResult ]
          )
      )
    }, Promise.resolve([]))
  })
  .then((result) => {
    console.log(result)
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
