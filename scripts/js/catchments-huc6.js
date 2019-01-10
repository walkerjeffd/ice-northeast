const fs = require('fs')
const pgp = require('pg-promise')()

const db = pgp('postgres://jeff@trout.local/sheds')

const dataDirectory = '../../data'

const fetch = (huc6) => {
  console.log('fetch', huc6)
  return db.any(`
      WITH ch AS (
        SELECT featureid, huc12, substr(huc12, 1, 6) AS huc6
        FROM data.catchment_huc12
        WHERE substr(huc12, 1, 6)=$1::text
      )
      SELECT c.featureid as id, 'Feature' as type, ST_AsGeoJSON(c.geom, 5)::json AS geometry FROM gis.catchments c INNER JOIN ch ON c.featureid=ch.featureid
    `, huc6)
    .then((features) => ({
      id: huc6,
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
  const filename = `${dataDirectory}/huc6/${huc.id}.json`

  if (!fs.existsSync(`${dataDirectory}/huc6`)) {
    console.log(`creating directory: ${dataDirectory}/huc6`)
    fs.mkdirSync(`${dataDirectory}/huc6`)
  }

  console.log(`saving ${filename}`)
  fs.writeFileSync(filename, JSON.stringify(huc.json))
  return Promise.resolve(filename)
}

db.any('SELECT DISTINCT substr(huc12, 1, 6) AS huc6 FROM data.catchment_huc12')
  .then(rows => rows.map(d => d.huc6))
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
