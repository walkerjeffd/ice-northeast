const fs = require('fs')
const pgp = require('pg-promise')()

const db = pgp('postgres://jeff@trout.local/sheds')

const fetch = (huc8) => {
  console.log('fetch', huc8)
  return db.any(`
      WITH ch AS (
        SELECT featureid, huc12, substr(huc12, 1, 8) AS huc8
        FROM data.catchment_huc12
        WHERE substr(huc12, 1, 8)=$1::text
      )
      SELECT c.featureid as id, 'Feature' as type, ST_AsGeoJSON(c.geom, 5)::json AS geometry FROM gis.catchments c INNER JOIN ch ON c.featureid=ch.featureid
    `, huc8)
    .then((features) => ({
      id: huc8,
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
  const filename = `huc8/${huc.id}.json`
  console.log(`saving ${filename}`)
  fs.writeFileSync(filename, JSON.stringify(huc.json))
  return Promise.resolve(filename)
}

db.any('SELECT DISTINCT substr(huc12, 1, 8) AS huc8 FROM data.catchment_huc12')
  .then(rows => rows.map(d => d.huc8))
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
