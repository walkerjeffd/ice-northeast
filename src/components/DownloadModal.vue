<template>
  <div>
    <h3>HUC Layer Dataset</h3>
    <p>
      The HUC layer dataset can be downloaded either as a text file in comma-separate value (CSV) format or as a geospatial layer in GeoJSON format.
    </p>
    <p>
      Both file types will contain the following attributes (columns):
    </p>
    <ul>
      <li><code>id</code>: HUC ID</li>
      <li><code>name</code>: HUC Name</li>
      <li v-if="variable"><code>{{ variable.id }}</code>: {{ variable.label }}. For each HUC, the value is calculated as the area-weighted mean of the filtered catchments within it. These values correspond to those currently shown on the map.</li>
    </ul>
    <br>
    <div class="row">
      <div class="col-md-6">
        <h5><strong>CSV File</strong></h5>
        <p>Conatins only the dataset (identifiers and computed value of each HUC), and does not include the geospatial data (polygons). Can be viewed using Excel or any other standard data analysis program (e.g., python or R).</p>
        <p>
          <button type="button" class="btn btn-primary" @click="downloadHucCSV"><i class="fa fa-download"/> Download HUC Dataset (CSV)</button>
        </p>
      </div>
      <div class="col-md-6">
        <h5><strong>GeoJSON File</strong></h5>
        <p>
          Contains both the dataset (attribute table) and geospatial data (polygons). Can be viewed using QGIS or ArcGIS, or converted to a shapefile using the <a href="https://mygeodata.cloud/converter/geojson-to-shp" target="_blank">MyGeodata Converter</a>.
        </p>
        <p>
          <button type="button" class="btn btn-primary" @click="downloadHucGeoJSON"><i class="fa fa-download"/> Download HUC Layer (GeoJSON)</button>
        </p>
      </div>
    </div>

    <hr>
    <h3>Catchments Layer Dataset (Selected HUC Only)</h3>

    <p>
      The dataset for catchments within a selected HUC can be downloaded either as a text file in comma-separate value (CSV) format or as a geospatial layer in GeoJSON format.
    </p>
    <p>
      Each file format can include either all of the catchments or only those that meet the current set of filters (i.e., the filtered catchments).
    </p>
    <p>
      The GeoJSON file is only available when the catchments have been loaded for the selected HUC. See below for links to download shapefiles containing all of the catchments across the region.
    </p>
    <p>
      Both file types will contain the following attributes (columns):
    </p>
    <ul>
      <li><code>id</code>: Catchment ID</li>
      <li v-if="theme"><code>{{ theme.group.by }}</code>: {{ theme.label }} ID</li>
      <li v-for="variable in variables" :key="variable.id">
        <code>{{ variable.id }}</code>: {{ variable.label }}
      </li>
    </ul>
    <br>

    <div class="alert alert-warning" role="alert" v-if="!selectedFeature">
      <p>
        <i class="fa fa-exclamation-triangle"/>
        <strong style="margin-left:5px">No HUC Selected</strong>
      </p>
      <p>Select a HUC on the map, and then return here to download the dataset containing catchments within that HUC.</p>
    </div>

    <div class="row" v-else>
      <div class="col-md-6">
        <h5><strong>CSV File</strong></h5>
        <p>Contains only the dataset (identifier and values of each catchment), and does not include any geospatial data (polygons). Can be viewed using Excel or any other standard data analysis program (e.g., python or R).</p>
        <p>
          <button type="button" class="btn btn-primary" @click="downloadCatchmentsAllCSV"><i class="fa fa-download"/> Download All Catchments (CSV)</button>
        </p>
        <p>
          <button type="button" class="btn btn-primary" @click="downloadCatchmentsFilteredCSV"><i class="fa fa-download"/> Download Filtered Catchments (CSV)</button>
        </p>
      </div>
      <div class="col-md-6">
        <h5><strong>GeoJSON File</strong></h5>
        <div class="alert alert-warning" role="alert" v-if="!catchmentsLayer">
          <p>
            <i class="fa fa-exclamation-triangle"/>
            <strong style="margin-left:5px">Catchments Not Loaded for Selected HUC</strong>
          </p>
          <p>Catchments can only be downloaded in GeoJSON format when they are loaded for the selected HUC.</p>
          <p>To load the catchments, close this box and click the "Catchments" button on the Selected HUC toolbar. Then return here to download the catchments within the selected HUC in GeoJSON format.</p>
        </div>
        <div v-else>
          <p>
            Contains both the dataset (attribute table) and geospatial data (polygons). Can be viewed using QGIS or ArcGIS, or converted to a shapefile using the <a href="https://mygeodata.cloud/converter/geojson-to-shp" target="_blank">MyGeodata Converter</a>.
          </p>
          <p>
            <button type="button" class="btn btn-primary" @click="downloadCatchmentsAllGeoJSON"><i class="fa fa-download"/> Download All Catchments (GeoJSON)</button>
          </p>
          <p>
            <button type="button" class="btn btn-primary" @click="downloadCatchmentsFilteredGeoJSON"><i class="fa fa-download"/> Download Filtered Catchments (GeoJSON)</button>
          </p>
        </div>
      </div>
    </div>

    <hr>
    <h3>Catchments Layer Dataset (Entire Region)</h3>
    <p>
      The dataset for all catchments across the entire North Atlantic region can be downloaded as a comma-separate value (CSV) format and as a series of shapefiles.
    </p>

    <p>
      Due to the large size of this dataset, the shapefiles are divided into pre-staged regions by 2-digit HUC (see map below).
      The development of these files is described in more detail on the <a href="http://conte-ecology.github.io/shedsGisData/#the-national-hydrography-dataset-high-resolution-delineation-version-2-nhdhrdv2" target="_blank">SHEDS GIS Data</a> website.
    </p>

    <p>
      Only the CSV file contains the following set of attributes (columns):
    </p>

    <ul>
      <li><code>id</code>: Catchment ID</li>
      <li v-if="theme"><code>{{ theme.group.by }}</code>: {{ theme.label }} ID</li>
      <li v-for="variable in variables" :key="variable.id">
        <code>{{ variable.id }}</code>: {{ variable.label }}
      </li>
    </ul>

    <p>
      The shapefile <strong>does not</strong> include these attributes. However, the CSV file can be joined to the shapefile using QGIS or ArcGIS based on the <code>id</code> column in the CSV file and the <code>featureid</code> column in the shapefile.
    </p>

    <div class="row">
      <div class="col-md-6">
        <h5><strong>CSV Files</strong></h5>
        <p>Contains the attribute values for each catchment. Can be viewed using Excel or any other standard data analysis program (e.g., python or R).</p>
        <p>The downloaded dataset can include either all of the catchments or only those that meet the current set of filters (i.e., the filtered catchments).</p>
        <p>
          <button type="button" class="btn btn-primary" @click="downloadFullCatchmentsAllCSV"><i class="fa fa-download"/> Download All Catchments (CSV)</button>
        </p>
        <p>
          <button type="button" class="btn btn-primary" @click="downloadFullCatchmentsFilteredCSV"><i class="fa fa-download"/> Download Filtered Catchments (CSV)</button>
        </p>
      </div>
      <div class="col-md-6">
        <h5><strong>Shapefiles</strong></h5>
        <p>Contain the geospatial polygons for all catchments within each 2-digit HUC (see map below)</p>
        <p>
          These shapefiles <strong>do not</strong> contain the attributes listed above, but can be joined to the CSV file using the <code>featureid</code> and <code>id</code> columns.
        </p>
        <ul>
          <li>
            <a
              href="http://ecosheds.org/assets/nhdhrd/v2/spatial_01.zip"
              download
            >Region 01 Catchments (spatial_01.zip | 324 MB)</a>
          </li>
          <li>
            <a
              href="http://ecosheds.org/assets/nhdhrd/v2/spatial_02.zip"
              download
            >Region 02 Catchments (spatial_02.zip | 537 MB)</a>
          </li>
          <li>
            <a
              href="http://ecosheds.org/assets/nhdhrd/v2/spatial_03.zip"
              download
            >Region 03 Catchments (spatial_03.zip | 114 MB)</a>
          </li>
          <li>
            <a
              href="http://ecosheds.org/assets/nhdhrd/v2/spatial_04.zip"
              download
            >Region 04 Catchments (spatial_04.zip | 203 MB)</a>
          </li>
          <li>
            <a
              href="http://ecosheds.org/assets/nhdhrd/v2/spatial_05.zip"
              download
            >Region 05 Catchments (spatial_05.zip | 353 MB)</a>
          </li>
          <li>
            <a
              href="http://ecosheds.org/assets/nhdhrd/v2/spatial_06.zip"
              download
            >Region 06 Catchments (spatial_06.zip | 41 MB)</a>
          </li>
        </ul>
        <img
          src="../assets/img/download/hydrologic-regions.png"
          alt="Hydrologic Regions"
          width="75%"
          class="img-rounded img-center"
        >
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import download from 'downloadjs'
import * as topojson from 'topojson-client'
import { Parser } from 'json2csv'

import { mapGetters } from 'vuex'

import { xf, getGroupByKey, isFiltered } from '@/libs/IceCrossfilter'

export default {
  props: ['catchmentsLayer', 'getCatchmentValues', 'selectedFeature'],
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['layer', 'variable', 'variables', 'theme'])
  },
  methods: {
    fetchHucLayer () {
      return axios.get(this.layer.url)
        .then(response => response.data)
        .then(data => {
          let geoJson = data
          if (this.layer.type === 'topojson') {
            geoJson = topojson.feature(data, data.objects[this.layer.object])
          }

          geoJson.features.forEach(d => {
            d.properties.id = d.id
            const group = getGroupByKey(d.id)
            d.properties[this.variable.id] = group ? group.mean : null
          })

          return geoJson
        })
    },
    downloadHucCSV () {
      this.fetchHucLayer()
        .then(geoJson => {
          const data = geoJson.features.map(d => d.properties)
          const json2csvParser = new Parser({ fields: ['id', 'name', this.variable.id] })
          const csv = json2csvParser.parse(data)

          download(csv, `ice-${this.theme.id}-${this.variable.id}.csv`, 'text/csv')
        })
        .catch(err => {
          console.log(err)
          alert('Error occurred\n\n' + err.toString())
        })
    },
    downloadHucGeoJSON () {
      this.fetchHucLayer()
        .then(geoJson => {
          download(JSON.stringify(geoJson), `ice-${this.theme.id}-${this.variable.id}.json`, 'application/json')
        })
        .catch(err => {
          console.log(err)
          alert('Error occurred\n\n' + err.toString())
        })
    },
    fetchCatchmentLayer () {
      return axios.get(this.catchmentsLayer.url)
        .then(response => response.data)
        .then(data => {
          let geoJson = data

          if (this.catchmentsLayer.type === 'topojson') {
            geoJson = topojson.feature(data, data.objects[this.catchmentsLayer.object])
          }

          geoJson.features.forEach(d => {
            d.properties.id = d.id
            const values = this.getCatchmentValues(d)
            d.properties[this.theme.group.by] = values ? values[this.theme.group.by] : null
            this.variables.forEach(v => {
              d.properties[v.id] = values ? values[v.id] : null
            })
          })

          return geoJson
        })
    },
    downloadCatchmentsAllCSV () {
      if (!this.selectedFeature) return
      const data = xf.all.all()
        .filter(d => d[this.theme.group.by] === this.selectedFeature.id)
      const json2csvParser = new Parser({ fields: ['id', this.theme.group.by, ...this.variables.map(d => d.id)] })
      const csv = json2csvParser.parse(data)
      download(csv, `ice-${this.theme.id}-${this.selectedFeature.id}-catchments-all.csv`, 'text/csv')
    },
    downloadCatchmentsFilteredCSV () {
      if (!this.selectedFeature) return
      const data = xf.all.allFiltered()
        .filter(d => d[this.theme.group.by] === this.selectedFeature.id)
      const json2csvParser = new Parser({ fields: ['id', this.theme.group.by, ...this.variables.map(d => d.id)] })
      const csv = json2csvParser.parse(data)

      download(csv, `ice-${this.theme.id}-${this.selectedFeature.id}-catchments-filtered.csv`, 'text/csv')
    },
    downloadFullCatchmentsAllCSV () {
      const data = xf.all.all()
      const json2csvParser = new Parser({ fields: ['id', this.theme.group.by, ...this.variables.map(d => d.id)] })
      const csv = json2csvParser.parse(data)
      download(csv, 'ice-catchments-all.csv', 'text/csv')
    },
    downloadFullCatchmentsFilteredCSV () {
      const data = xf.all.allFiltered()
      const json2csvParser = new Parser({ fields: ['id', this.theme.group.by, ...this.variables.map(d => d.id)] })
      const csv = json2csvParser.parse(data)

      download(csv, 'ice-catchments-filtered.csv', 'text/csv')
    },
    downloadCatchmentsAllGeoJSON () {
      this.fetchCatchmentLayer()
        .then(geoJson => {
          download(JSON.stringify(geoJson), `ice-${this.theme.id}-${this.selectedFeature.id}-catchments-all.json`, 'application/json')
        })
        .catch(err => {
          console.log(err)
          alert('Error occurred\n\n' + err.toString())
        })
    },
    downloadCatchmentsFilteredGeoJSON () {
      this.fetchCatchmentLayer()
        .then(geoJson => {
          geoJson.features = geoJson.features.filter(d => {
            const values = this.getCatchmentValues(d)
            return values && isFiltered(values.$index)
          })
          return geoJson
        })
        .then(geoJson => {
          download(JSON.stringify(geoJson), `ice-${this.theme.id}-${this.selectedFeature.id}-catchments-filtered.json`, 'application/json')
        })
        .catch(err => {
          console.log(err)
          alert('Error occurred\n\n' + err.toString())
        })
    }
  }
}
</script>
