const fs = require('fs')
const pgp = require('pg-promise')()
const topojson = require('topojson')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const config = yaml.safeLoad(fs.readFileSync('../config.yml', 'utf8')).default

const quantizeFactor = 1e6

const db = pgp({
  host: config.db.host,
  port: config.db.port,
  database: config.db.dbname,
  user: config.db.user,
  password: config.db.password
})

async function processHucLevel (hucLevel) {
  console.log(`processHucLevel(${hucLevel})`)
  return await db.any(`SELECT DISTINCT substr(huc12, 1, ${hucLevel}) AS id FROM data.catchment_huc12`)
    .then(results => results.map(d => d.id))
}

async function fetchCatchments (hucLevel, id) {
  console.log(`fetchCatchments(${hucLevel}, ${id})`)
  const hucName = `huc${hucLevel}`
  return await db.any(`
      WITH ch AS (
        SELECT featureid, huc12, substr(huc12, 1, ${hucLevel}) AS ${hucName}
        FROM data.catchment_huc12
        WHERE substr(huc12, 1, ${hucLevel})=$1::text
      )
      SELECT c.featureid as id, 'Feature' as type, ST_AsGeoJSON(c.geom)::json AS geometry FROM gis.catchments c INNER JOIN ch ON c.featureid=ch.featureid
    `, id)
    .then((features) => ({
      type: 'FeatureCollection',
      features
    }))
}

function convertGeojsonToTopojson (id, data) {
  console.log(`convertGeojsonToTopojson(${id}, ...)`)
  return topojson.topology({ catchments: data }, quantizeFactor)
}

function saveCatchmentsGeojson (hucLevel, id, data) {
  console.log(`saveCatchmentsGeojson(${hucLevel}, ${id}, ...)`)
  const hucName = `huc${hucLevel}`
  const filename = `geojson/${hucName}/${id}.json`

  if (!fs.existsSync(`geojson/${hucName}`)) {
    console.log(`creating directory: geojson/${hucName}`)
    fs.mkdirSync(`geojson/${hucName}`)
  }

  console.log(`saving ${filename}`)
  fs.writeFileSync(filename, JSON.stringify(data))
  return filename
}

function saveCatchmentsTopojson (hucLevel, id, data, region) {
  console.log(`saveCatchmentsTopojson(${hucLevel}, ${id}, ...)`)
  let hucName = `huc${hucLevel}`
  if (region) {
    hucName = `${hucName}-${region}`
  }
  const filename = `topojson/${hucName}/${id}.json`

  if (!fs.existsSync(`topojson/${hucName}`)) {
    console.log(`creating directory: topojson/${hucName}`)
    fs.mkdirSync(`topojson/${hucName}`)
  }

  console.log(`saving ${filename}`)
  fs.writeFileSync(filename, JSON.stringify(data))
  return filename
}

async function processAll () {
  const results = []

  for (let hucLevel of [6, 8, 10]) {
    const hucIds = await processHucLevel(hucLevel)
    for (let id of hucIds) {
      const catchmentsGeojson = await fetchCatchments(hucLevel, id)

      const catchmentsTopojson = convertGeojsonToTopojson(id, catchmentsGeojson)
      const topojsonFilename = saveCatchmentsTopojson(hucLevel, id, catchmentsTopojson)

      results.push({
        hucLevel,
        id,
        topojson: topojsonFilename
      })
    }
  }

  const hucLevel = 12
  const hucIds = await processHucLevel(hucLevel)
  for (let region of ['01', '02', '03', '04', '05', '06']) {
    const hucRegionIds = hucIds.filter(d => d.substr(0, 2) === region)
    for (let id of hucRegionIds) {
      const catchmentsGeojson = await fetchCatchments(hucLevel, id)

      const catchmentsTopojson = convertGeojsonToTopojson(id, catchmentsGeojson)
      const topojsonFilename = saveCatchmentsTopojson(hucLevel, id, catchmentsTopojson, region)

      results.push({
        hucLevel,
        region,
        id,
        topojson: topojsonFilename
      })
    }
  }
  return results
}

processAll()
  .then(() => {
    console.log('done')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
