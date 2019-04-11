<template>
  <div id="app" class="full">
    <ice-header title="Stream Temperature and Brook Trout Occupancy in the North Atlantic" />
    <div class="ice-container">
      <div class="ice-left-sidebar">
        <div class="ice-box" style="text-align:right">
          <div class="btn-group btn-group-justified btn-group-xs">
            <a class="btn btn-default" @click="modals.about = true">
              <i class="fa fa-info-circle"/> About
            </a>
            <a class="btn btn-default" @click="modals.guide = true">
              <i class="fa fa-book"/> User Guide
            </a>
            <a class="btn btn-default" @click="modals.dataset = true">
              <i class="fa fa-table"/> Datasets
            </a>
            <a class="btn btn-default" @click="modals.download = true">
              <i class="fa fa-download"/> Download
            </a>
            <a class="btn btn-default" @click="modals.contact = true">
              <i class="fa fa-envelope"/> Contact
            </a>
          </div>
        </div>
        <div class="ice-box">
          <div class="row">
            <div class="col-xs-3">
              <div class="ice-box-label">Resolution</div>
            </div>
            <div class="col-xs-9">
              <ice-select
                id="theme"
                :options="themes"
                :value="selected.theme"
                :multiple="false"
                @input="selectTheme"
                value-field="id"
                text-field="label"
                title="Select dataset..."
              />
            </div>
          </div>
        </div>
        <div class="ice-box">
          <div class="row">
            <div class="col-xs-3">
              <div class="ice-box-label">States</div>
            </div>
            <div class="col-xs-9">
              <ice-select
                id="region"
                :config="regionFilter.config"
                :options="regionFilter.options"
                :value="regionFilter.selected"
                :multiple="true"
                @input="selectRegions"
                value-field="id"
                text-field="label"
                title="Select states..."
              />
            </div>
          </div>
        </div>
        <div class="ice-box">
          <div class="row">
            <div class="col-xs-3">
              <div class="ice-box-label">Variable</div>
            </div>
            <div class="col-xs-9">
              <ice-select
                id="variable"
                :options="variableOptions"
                :value="selected.variable"
                :multiple="false"
                grouped
                @input="selectVariable"
                value-field="id"
                text-field="label"
                title="Select variable..."
              />
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12">
              <ice-legend
                id="main"
                :color-scale="colorScale"
                :variable-scale="variableScale"
                :variable="variable"
                :width="420"
                :height="20" />
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12 text-right">
              <a href="#" @click.prevent="show.legendSettings = !show.legendSettings"><small>Legend Options</small></a>
            </div>
          </div>
        </div>
        <div class="ice-box" v-if="show.legendSettings">
          <div class="row">
            <div class="col-xs-3">
              <div class="ice-box-label">Colors</div>
            </div>
            <div class="col-xs-9">
              <ice-select
                id="color"
                :options="color.options"
                :value="color.selected"
                :multiple="false"
                @input="selectColor"
                value-field="id"
                text-field="label"
                title="Select color scheme..."
              />
            </div>
          </div>
          <div class="row" style="margin-top:10px">
            <div class="col-xs-3">
              <div class="ice-box-label">Transform</div>
            </div>
            <div class="col-xs-9">
              <ice-select
                id="transform"
                :options="transform.options"
                :value="transform.selected"
                :multiple="false"
                @input="selectTransform"
                value-field="id"
                text-field="label"
                title="Select transformation..."
              />
            </div>
          </div>
        </div>
      </div>
      <div class="ice-right-sidebar">
        <div class="ice-box">
          <div class="ice-box-title">Histograms and Filters</div>
          <ice-select
            id="filters"
            :options="filterOptions"
            :value="selected.filters"
            :multiple="true"
            grouped
            @input="selectFilters"
            value-field="id"
            text-field="label"
            title="Select variable(s)..."
          />
          <div class="ice-filter-legend">
            <div>
              <i class="fa fa-square" style="color:steelblue"></i>
              All Catchments
              <span class="pull-right" v-show="theme" style="display:none">{{ counts.all.filtered.toLocaleString() }} of {{ counts.all.total.toLocaleString() }} filtered</span>
            </div>
            <div v-if="counts.subset.total > 0">
              <i class="fa fa-square" style="color:orangered"></i>
              Catchments In Selected HUC
              <span class="pull-right" v-show="theme" style="display:none">{{ counts.subset.filtered.toLocaleString() }} of {{ counts.subset.total.toLocaleString() }} filtered</span>
            </div>
          </div>
          <div
            class="ice-filter-container"
            style="max-height:900px">
            <ice-filter
              v-for="variable in filterVariables"
              :key="variable.id"
              :variable="variable"
              :width="360"
              mean-line
              @destroy="destroyFilter"
            />
          </div>
        </div>
      </div>
      <selected-huc-box
        :selected="selected.feature"
        @zoomTo="zoomToFeature"
        @unselect="selectFeature"
        @showCatchments="showCatchments"
        v-if="selected.feature" />
      <selected-catchment-box
        :selected="catchments.selected"
        @zoomTo="zoomToFeature"
        @unselect="selectCatchment"
        v-if="catchments.selected" />
      <ice-map :options="map.options" :overlays="map.overlays">
        <ice-map-layer
          id="huc"
          :layer="layer"
          :set-bounds="true"
          :get-fill="getFill"
          :get-value="getValue"
          :get-label="getFeatureLabel"
          :selected="selected.feature"
          @click="selectFeature" />
        <ice-map-layer
          id="catchment"
          v-if="catchments.layer"
          :layer="catchments.layer"
          :set-bounds="false"
          :get-fill="getCatchmentFill"
          :get-value="getCatchmentValue"
          :get-label="getCatchmentLabel"
          :selected="catchments.selected"
          @click="selectCatchment" />
      </ice-map>
      <div
        class="ice-loading"
        v-show="loading">
        <h1>Loading</h1>
        <div><i class="fa fa-spinner fa-spin fa-5x fa-fw" /></div>
      </div>
    </div>
    <ice-modal
      :show="modals.about"
      @close="modals.about = false"
      size="lg">
      <span slot="title">About ICE</span>
      <div slot="body">
        <about-modal></about-modal>
      </div>
    </ice-modal>
    <ice-modal
      :show="modals.guide"
      @close="modals.guide = false"
      size="lg">
      <span slot="title">User Guide</span>
      <div slot="body">
        <guide-modal></guide-modal>
      </div>
    </ice-modal>
    <ice-modal
      :show="modals.dataset"
      @close="modals.dataset = false"
      size="lg">
      <span slot="title">Datasets</span>
      <div slot="body">
        <dataset-modal></dataset-modal>
      </div>
    </ice-modal>
    <ice-modal
      :show="modals.download"
      @close="modals.download = false"
      size="lg">
      <span slot="title">Download</span>
      <div slot="body">
        <download-modal :catchmentsLayer="catchments.layer" :getCatchmentValues="getCatchmentValues" :selectedFeature="selected.feature"></download-modal>
      </div>
    </ice-modal>
    <ice-modal
      :show="modals.contact"
      @close="modals.contact = false"
      size="lg">
      <span slot="title">Contact Us</span>
      <div slot="body">
        <contact-modal></contact-modal>
      </div>
    </ice-modal>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import * as d3 from 'd3'

import { IceFilter, IceHeader, IceLegend, IceSelect, IceMap, IceMapLayer, IceModal, EventBus as evt, xf, getGroupByKey, isFiltered } from 'ice-components'

import SelectedHucBox from './components/SelectedHucBox.vue'
import SelectedCatchmentBox from './components/SelectedCatchmentBox.vue'
import AboutModal from './components/AboutModal.vue'
import GuideModal from './components/GuideModal.vue'
import DatasetModal from './components/DatasetModal.vue'
import DownloadModal from './components/DownloadModal.vue'
import ContactModal from './components/ContactModal.vue'

require('webpack-jquery-ui/slider')

const filterPercentVariable = {
  id: '$filter_percent',
  label: '% Area Filtered',
  map: true,
  filter: false,
  formats: {
    axis: '.0%',
    value: '.1%'
  },
  scale: {
    domain: [0, 1],
    transform: 'linear'
  },
  group: 'Filter Statistics'
}

export default {
  name: 'app',
  components: {
    IceFilter,
    IceHeader,
    IceLegend,
    IceMap,
    IceMapLayer,
    IceModal,
    IceSelect,

    SelectedHucBox,
    SelectedCatchmentBox,
    AboutModal,
    GuideModal,
    DatasetModal,
    DownloadModal,
    ContactModal
  },
  data () {
    return {
      loading: true,
      modals: {
        about: false,
        guide: false,
        dataset: false,
        download: false,
        contact: false
      },
      map: {
        options: {
          center: [42, -74],
          zoom: 6,
          maxZoom: 18,
          minZoom: 5
        },
        overlays: [
          {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'Major Streams',
            layer: 'sheds:flowlines_strahler_3',
            visible: true
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'Minor Streams',
            layer: 'sheds:detailed_flowlines',
            minZoom: 10
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'NHD Waterbodies',
            layer: 'sheds:waterbodies'
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'HUC8 Boundaries',
            layer: 'sheds:wbdhu8'
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'HUC12 Boundaries',
            layer: 'sheds:wbdhu12',
            minZoom: 10
          }
        ]
      },
      show: {
        legendSettings: false
      },
      color: {
        options: [
          { id: 'YlGnBu', label: 'Yellow-Green-Blue' },
          { id: 'Viridis', label: 'Viridis' },
          { id: 'Inferno', label: 'Inferno' },
          { id: 'Warm', label: 'Warm' },
          { id: 'Cool', label: 'Cool' }
        ],
        selected: 'Viridis'
      },
      transform: {
        options: [
          { id: 'linear', label: 'Linear' },
          { id: 'log', label: 'Log' }
        ],
        selected: 'linear'
      },
      regionFilter: {
        config: {
          actionsBox: true,
          selectedTextFormat: 'count',
          countSelectedText: '{0} states selected',
          dropupAuto: false
        },
        options: [
          { id: 'CT', label: 'Connecticut' },
          { id: 'DE', label: 'Delaware' },
          { id: 'DC', label: 'District of Columbia' },
          { id: 'ME', label: 'Maine' },
          { id: 'MD', label: 'Maryland' },
          { id: 'MA', label: 'Massachusetts' },
          { id: 'NH', label: 'New Hampshire' },
          { id: 'NJ', label: 'New Jersey' },
          { id: 'NY', label: 'New York' },
          { id: 'PA', label: 'Pennsylvania' },
          { id: 'RI', label: 'Rhode Island' },
          { id: 'VT', label: 'Vermont' },
          { id: 'VA', label: 'Virginia' },
          { id: 'WV', label: 'West Virginia' }
        ],
        selected: ['CT', 'DE', 'DC', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT', 'VA', 'WV']
      },
      selected: {
        theme: null,
        variable: null,
        feature: null,
        filters: []
      },
      counts: {
        all: {
          total: 0,
          filtered: 0
        },
        subset: {
          total: 0,
          filtered: 0
        }
      },
      catchments: {
        layer: null,
        selected: null
      }
    }
  },
  computed: {
    ...mapGetters(['themes', 'theme', 'layer', 'variables', 'variable', 'stats']),
    variableOptions () {
      const variables = this.variables.filter(v => v.map)
      return [filterPercentVariable, ...variables]
    },
    filterOptions () {
      return this.variables.filter(v => v.filter)
    },
    filterVariables () {
      if (!this.variables) return []
      return this.selected.filters
        .map(id => this.variables.find(d => d.id === id))
    },
    variableScale () {
      if (!this.variable) return d3.scaleLinear()

      const domain = this.variable.scale.domain.slice(0)

      let scale
      switch (this.transform.selected) {
        case 'log':
          scale = d3.scaleLog()
          const positiveValues = xf.all.all().map(d => d[this.variable.id]).filter(d => d > 0).sort()
          if (domain[0] <= 0) domain[0] = +d3.quantile(positiveValues, 0.05).toPrecision(1)
          break
        case 'linear':
          scale = d3.scaleLinear()
          break
        default:
          scale = d3.scaleLinear()
          break
      }

      return scale
        .domain(domain)
        .range([0, 1])
        .clamp(true)
    },
    colorScale () {
      return d3.scaleSequential(d3[`interpolate${this.color.selected}`])
    }
  },
  created () {
    console.log('app:created')
    this.catchments.map = new Map()

    axios.get('ice-sheds.json')
      .then(response => response.data)
      .then(config => this.$store.dispatch('loadConfig', config))
      .then(config => {
        const theme = config.themes.find(d => d.default)
        return this.selectTheme(theme.id)
      })

    evt.$on('filter:render', this.onFilter)
    xf.all.onChange(() => {
      this.counts.all.filtered = xf.all.allFiltered().length
    })
    xf.subset.onChange(() => {
      this.counts.subset.filtered = xf.subset.allFiltered().length
    })
  },
  beforeDestroy () {
    console.log('app:beforeDestroy')
    evt.$off('filter:render', this.onFilter)
  },
  methods: {
    onFilter () {
      // console.log('app:onFilter')
      evt.$emit('map:render')
    },
    destroyFilter (id) {
      console.log('app:destroyFilter', id)
      const index = this.selected.filters.indexOf(id)
      this.selected.filters.splice(index, 1)
    },
    selectColor (color) {
      console.log('app:selectColor', color)
      this.color.selected = color
      evt.$emit('map:render')
    },
    selectRegions (regions) {
      console.log('app:selectRegions', regions)
      this.regionFilter.selected = regions
      if (this.regionFilter.dim) {
        this.regionFilter.dim.filterFunction(d => regions.includes(d))
      }
      evt.$emit('filter:render')
    },
    selectTransform (transform) {
      console.log('app:selectTransform', transform)
      this.transform.selected = transform
      evt.$emit('map:render')
    },
    selectTheme (id) {
      console.log('app:selectTheme', id)
      this.loading = true

      this.clearCatchments()
      this.selected.feature = null

      if (this.regionFilter.dim) {
        this.regionFilter.dim.filterAll()
        this.regionFilter.dim.dispose()
      }

      this.$store.dispatch('selectThemeById', id)
        .then(() => {
          this.selected.theme = id
          this.counts.all.total = xf.all.size()
          return Promise.resolve()
        })
        .then(() => {
          if (!this.selected.variable) {
            // set default variable
            const variable = this.variableOptions.find(d => d.default)
            this.selectVariable(variable.id)
          } else {
            this.selectVariable(this.selected.variable)
          }
          return Promise.resolve()
        })
        .then(() => {
          this.regionFilter.dim = xf.all.dimension(d => d.state)
          this.selectRegions(this.regionFilter.selected)
          return Promise.resolve()
        })
        .then(() => {
          this.loading = false
          return Promise.resolve()
        })
    },
    selectVariable (id) {
      console.log('app:selectVariable', id)
      let promise

      if (id === filterPercentVariable.id) {
        promise = this.$store.dispatch('selectVariableFilterPercent', filterPercentVariable)
      } else {
        promise = this.$store.dispatch('selectVariableById', id)
      }

      promise
        .then(() => {
          this.selected.variable = id
        })
        .then(() => {
          this.selectTransform(this.variable.scale.transform)
        })
        .then(() => {
          evt.$emit('map:render')
        })
    },
    selectFeature (feature) {
      console.log('app:selectFeature', feature)
      this.clearCatchments()

      if (!feature || this.selected.feature === feature) {
        this.selected.feature = null
        this.catchments.data = []
      } else {
        this.selected.feature = feature
        this.catchments.data = xf.all.all()
          .filter(d => d[this.theme.group.by] === feature.id)
          .slice()
        xf.subset.remove()
        xf.subset.add(this.catchments.data)
        evt.$emit('filter:set')
      }

      this.counts.subset.total = this.catchments.data.length

      evt.$emit('filter:render')
    },
    selectFilters (filters) {
      console.log('app:selectFilters', filters)
      this.selected.filters = filters
    },
    zoomToFeature (feature) {
      console.log('app:zoomToFeature', feature)
      evt.$emit('map:zoomTo', feature)
    },
    getFeatureLabel (feature) {
      let label = feature.id
      if (feature.properties && feature.properties.name) {
        label = `${feature.properties.name} (${feature.id})`
      }
      return `${this.theme.label}: ${label}`
    },
    getFill (feature) {
      if (this.catchments.layer) {
        return 'none'
      }
      let value = null
      if (!this.catchments.layer || !this.selected.feature || this.selected.feature.id !== feature.id) {
        value = this.getValue(feature)
      }
      const scaled = value !== null ? this.variableScale(value) : null
      const color = scaled !== null ? this.colorScale(scaled) : 'none'
      return color
    },
    getValue (feature) {
      const group = getGroupByKey(feature.id)
      return group ? group.mean : null
    },
    showCatchments (feature) {
      console.log('app:showCatchments', feature)
      this.catchments.layer = {
        geometry: 'polygon',
        type: 'topojson',
        object: 'catchments',
        url: `${this.theme.id}/catchments/${feature.id}.json`
      }

      this.catchments.map.clear()
      this.catchments.data.forEach((d) => {
        this.catchments.map.set(d.id, d)
      })
      evt.$emit('map:render')
      evt.$emit('filter:render')

      this.zoomToFeature(feature)
    },
    getCatchmentValue (catchment) {
      return this.catchments.map.has(catchment.id) ? this.catchments.map.get(catchment.id)[this.variable.id] : null
    },
    getCatchmentValues (catchment) {
      return this.catchments.map.has(catchment.id) ? this.catchments.map.get(catchment.id) : null
    },
    getCatchmentFill (catchment) {
      if (!this.catchments.map.has(catchment.id)) return 'none'
      const row = this.catchments.map.get(catchment.id)
      const value = row !== null && isFiltered(row.$index) ? row[this.variable.id] : null
      const scaled = value !== null ? this.variableScale(value) : null
      const color = scaled !== null ? this.colorScale(scaled) : 'none'
      return color
    },
    getCatchmentLabel (catchment) {
      return `Catchment: ${catchment.id}`
    },
    selectCatchment (catchment) {
      console.log('app:selectCatchment', catchment)
      if (!catchment || this.catchments.selected === catchment) {
        this.catchments.selected = null
      } else {
        this.catchments.selected = catchment
      }

      evt.$emit('map:render')
    },
    clearCatchments () {
      console.log('app:clearCatchments')
      this.catchments.layer = null
      this.catchments.map.clear()
      this.catchments.selected = null
      this.catchments.data = []
      evt.$emit('filter:clearSubset')
      xf.subset.remove()
      this.counts.subset.total = 0
    }
  }
}
</script>

<style>
body {
  padding: 0px;
  margin: 0px;
  font-family: "proxima-nova-alt", Helvetica, Arial, sans-serif;
}

a {
  cursor: pointer;
}

.ice-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.ice-left-sidebar {
  display: inline;
  position: absolute;
  top: 60px;
  left: 0px;
  width: 440px;
  z-index: 3000;
}

.ice-right-sidebar {
  display: inline;
  position: absolute;
  top: 60px;
  right: 0px;
  width: 475px;
  z-index: 3000;
}

.ice-box {
  padding: 10px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  border-bottom-right-radius: 2px;
  box-shadow: 0px 0px 3px 0px #aaa;
}

.ice-box-title {
  font-weight: bold;
  font-size: 1.1em;
  font-variant: small-caps;
  margin-bottom: 5px;
}

.ice-box-label {
  font-weight: bold;
  font-size: 1.1em;
  font-variant: small-caps;
  text-align: right;
  margin-top: 5px
}

.ice-filter-legend {
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 5px;
  padding-right: 5px;
}

.ice-filter-container {
  max-height: 460px;
  margin-top: 5px;
  overflow-y: auto;
  overflow-x: hidden;
}

.ice-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  padding-top: 50px;
  z-index: 5000;
  background: rgba(0, 0, 0, 0.7);
  text-align: center;
  color: #f5f5f5;
}
</style>
