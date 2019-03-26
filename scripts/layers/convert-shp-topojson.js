// convert shapefile to topojson

const fs = require('fs')
const shapefile = require('shapefile')
const topojson = require('topojson')
const Promise = require('bluebird')

const quantizeFactor = 1e6
const simplifyQuantile = 0.01

const hucLevels = [6, 8, 10]

const promises = Promise.mapSeries(hucLevels, (hucLevel) => {
  const hucName = `huc${hucLevel}`
  console.log(`converting ${hucName}`)

  return shapefile.read(`shp/${hucName}.shp`)
    .then((results) => {
      results.features = results.features
        .filter(d => d.geometry !== null)
      results.features.forEach(d => {
        d.id = d.properties[hucName]
        d.properties = {
          name: d.properties.name
        }
      })
      return results
    })
    .then((results) => {
      const topology = topojson.topology({ [hucName]: results }, quantizeFactor)
      const presimplified = topojson.presimplify(topology)
      const simplified = topojson.simplify(presimplified, topojson.quantile(presimplified, simplifyQuantile))
      return simplified
    })
    .then((results) => {
      const filename = `../../${hucName}/layer.json`

      console.log(`saving ${filename}`)

      fs.writeFileSync(filename, JSON.stringify(results, null, 2))
      return filename
    })
})

promises
  .then((results) => {
    const huc12Regions = ['01', '02', '03', '04', '05', '06']

    const huc12Promises = Promise.mapSeries(huc12Regions, (region) => {
      const hucLevel = 12
      const hucName = `huc${hucLevel}`
      console.log(`converting ${hucName}-${region}`)

      return shapefile.read(`shp/${hucName}.shp`)
        .then((results) => {
          results.features = results.features
            .filter(d => d.geometry !== null)
            .filter(d => d.properties[hucName].substr(0, 2) === region)
          results.features.forEach(d => {
            d.id = d.properties[hucName]
            d.properties = {
              name: d.properties.name
            }
          })
          return results
        })
        .then((results) => {
          const topology = topojson.topology({ [hucName]: results }, quantizeFactor)
          const presimplified = topojson.presimplify(topology)
          const simplified = topojson.simplify(presimplified, topojson.quantile(presimplified, simplifyQuantile))
          return simplified
        })
        .then((results) => {
          const filename = `../../${hucName}-${region}/layer.json`

          console.log(`saving ${filename}`)

          fs.writeFileSync(filename, JSON.stringify(results))
          return filename
        })
    })
    return huc12Promises
  })
  .then((results) => {
    console.log('done')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
