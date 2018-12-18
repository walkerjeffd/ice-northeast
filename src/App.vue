<template>
  <div id="app" class="full">
    <ice-header title="SHEDS Northeast" />
    <div class="ice-container">
      <div class="ice-left-sidebar">
        <div class="ice-box">
          <button class="btn btn-default" disabled>
            <i class="fa fa-question-circle"/> About ICE
          </button>
          <button class="btn btn-default" disabled>
            <i class="fa fa-table"/> About the Data
          </button>
          <button class="btn btn-default" disabled>
            <i class="fa fa-envelope"/> Contact Us
          </button>
        </div>
        <div class="ice-box">
          <div class="row">
            <div class="col-xs-3">
              <div class="ice-box-label">Resolution</div>
            </div>
            <div class="col-xs-9">
              <select-picker
                id="theme"
                :config="{}"
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
              <select-picker
                id="states"
                :config="{
                  actionsBox: true,
                  selectedTextFormat: 'count',
                  countSelectedText: '{0} states selected',
                  dropupAuto: false
                }"
                :options="stateOptions"
                :value="selected.states"
                :multiple="true"
                @input="selectStates"
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
              <select-picker
                id="variable"
                :config="{}"
                :options="variableOptions"
                :value="selected.variable"
                :multiple="false"
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
              <a href="#" @click.prevent="show.legendSettings = !show.legendSettings"><small>Color Settings</small></a>
            </div>
          </div>
        </div>
        <div class="ice-box" v-if="show.legendSettings">
          <div class="row">
            <div class="col-xs-3">
              <div class="ice-box-label">Colors</div>
            </div>
            <div class="col-xs-9">
              <select-picker
                id="color"
                :config="{}"
                :options="colorOptions"
                :value="selected.color"
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
              <select-picker
                id="color"
                :config="{}"
                :options="transformOptions"
                :value="selected.transform"
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
          <select-picker
            :config="{}"
            :options="filterOptions"
            :value="selected.filters"
            :multiple="true"
            @input="selectFilters"
            value-field="id"
            text-field="label"
            title="Select variable(s)..."
          />
          <div class="ice-filter-legend">
            <div>
              <i class="fa fa-square" style="color:steelblue"></i>
              All Catchments
              <span class="pull-right" v-show="theme" style="display:none">{{ filteredCount.toLocaleString() }} of {{ stats.count.toLocaleString() }} filtered</span>
            </div>
          </div>
          <div
            class="ice-filter-container"
            style="max-height:900px">
            <ice-filter
              v-for="variable in filterVariables"
              :key="variable.id"
              :variable="variable"
              width="360"
              @destroy="destroyFilter"
            />
          </div>
        </div>
      </div>
      <ice-info-box
        :selected="selected.feature"
        :get-label="getFeatureLabel"
        @zoomTo="zoomToFeature"
        @unselect="selectFeature"
        @showCatchments="showCatchments"
        v-if="selected.feature" />
      <ice-map :options="map.options">
        <ice-map-layer
          :layer="layer"
          :set-bounds="true"
          :get-fill="getFill"
          :get-value="getValue"
          :get-label="getFeatureLabel"
          :selected="selected.feature"
          @click="selectFeature" />
        <ice-map-layer
          v-if="catchments.layer"
          :layer="catchments.layer"
          :set-bounds="false"
          :get-fill="getCatchmentFill"
          :get-value="getCatchmentValue"
          :get-label="getCatchmentLabel"
          :selected="selected.catchment"
          @click="selectCatchment" />
      </ice-map>
      <div
        class="ice-loading"
        v-show="loading">
        <h1>Loading</h1>
        <div><i class="fa fa-spinner fa-spin fa-5x fa-fw" /></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import * as d3 from 'd3'

import evt from './event-bus'

import IceHeader from './components/IceHeader.vue'
import IceMap from './components/IceMap.vue'
import IceMapLayer from './components/IceMapLayer.vue'
import IceLegend from './components/IceLegend.vue'
import IceInfoBox from './components/IceInfoBox.vue'
import IceFilter from './components/IceFilter.vue'
import SelectPicker from './components/SelectPicker.vue'
import { getGroupByKey, addDim, getDim, removeDim, getData, isFiltered, getFilteredCount } from '@/store'

export default {
  name: 'app',
  components: {
    IceHeader,
    IceMap,
    IceMapLayer,
    IceLegend,
    IceInfoBox,
    IceFilter,
    SelectPicker
  },
  data () {
    return {
      loading: true,
      map: {
        options: {
          center: [42, -74],
          zoom: 6,
          maxZoom: 18,
          minZoom: 5
        }
      },
      show: {
        legendSettings: false
      },
      colorOptions: [
        { id: 'YlGnBu', label: 'Yellow-Green-Blue' },
        { id: 'Viridis', label: 'Viridis' },
        { id: 'Inferno', label: 'Inferno' },
        { id: 'Warm', label: 'Warm' },
        { id: 'Cool', label: 'Cool' }
      ],
      stateOptions: [
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
      transformOptions: [
        { id: 'linear', label: 'Linear' },
        { id: 'log', label: 'Log' }
      ],
      selected: {
        theme: null,
        variable: null,
        color: 'Viridis',
        transform: 'linear',
        states: ['CT', 'DE', 'DC', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT', 'VA', 'WV'],
        feature: null,
        filters: []
      },
      filteredCount: 0,
      catchments: {
        layer: null,
        data: []
      }
    }
  },
  computed: {
    ...mapGetters(['themes', 'theme', 'layer', 'variables', 'variable', 'stats']),
    catchmentsMap () {
      // console.log('catchmentsMap')
      const map = new Map()
      this.catchments.data.forEach((d) => {
        map.set(d.id, d)
      })
      return map
    },
    variableOptions () {
      return this.variables.filter(v => v.map)
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

      const transform = this.selected.transform
      const domain = this.variable.scale.domain

      let scale
      switch (transform) {
        case 'log':
          scale = d3.scaleLog()
          if (domain[0] <= 0) domain[0] = 0.1
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
      return d3.scaleSequential(d3[`interpolate${this.selected.color}`])
    }
  },
  created () {
    axios.get('config.json')
      .then(response => response.data)
      .then(config => this.$store.dispatch('loadConfig', config))
      .then(config => {
        const theme = config.themes.find(d => d.default)
        return this.selectTheme(theme.id)
      })

    evt.$on('filter', () => {
      this.filteredCount = getFilteredCount()
      evt.$emit('map:render')
    })
  },
  methods: {
    destroyFilter (id) {
      // console.log('destroyFilter', id)
      const index = this.selected.filters.indexOf(id)
      this.selected.filters.splice(index, 1)
    },
    selectColor (color) {
      this.selected.color = color
      evt.$emit('map:render')
    },
    selectStates (states) {
      this.selected.states = states
      const dim = getDim('state')
      if (dim) dim.filterFunction(d => states.includes(d))
      evt.$emit('filter')
    },
    selectTransform (transform) {
      this.selected.transform = transform
      evt.$emit('map:render')
    },
    selectTheme (id) {
      this.loading = true
      removeDim('state')
      this.$store.dispatch('selectThemeById', id)
        .then(() => {
          this.selected.theme = id
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
          addDim('state')
          this.selectStates(this.selected.states)
          return Promise.resolve()
        })
        .then(() => {
          this.loading = false
          return Promise.resolve()
        })
    },
    selectVariable (id) {
      this.$store.dispatch('selectVariableById', id)
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
      this.catchments.layer = null
      this.catchments.data = []
      if (!feature || this.selected.feature === feature) {
        this.selected.feature = null
      } else {
        this.selected.feature = feature
      }
      evt.$emit('map:render')
    },
    selectFilters (filters) {
      this.selected.filters = filters
    },
    zoomToFeature (feature) {
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
      // console.log('showCatchments()', feature)
      this.catchments.layer = {
        geometry: 'polygon',
        type: 'geojson',
        url: `${this.theme.id}/${feature.id}.json`
      }
      const data = getData()
        .map((d, i) => ({
          $index: i,
          ...d
        }))
        .filter(d => d[this.theme.group.by] === feature.id)
      this.catchments.data = Object.freeze(data)
      evt.$emit('map:render')
    },
    getCatchmentValue (d) {
      // const row = this.catchments.data.find(row => row.id === d.id)
      const row = this.catchmentsMap.get(d.id)
      return row && isFiltered(row.$index) ? row[this.variable.id] : null
    },
    getCatchmentFill (d) {
      const value = this.getCatchmentValue(d)
      const scaled = value !== null ? this.variableScale(value) : null
      const color = scaled !== null ? this.colorScale(scaled) : 'none'
      return color
    },
    getCatchmentLabel (d) {
      return `Catchment: ${d.id}`
    },
    selectCatchment (d) {
      console.log('selectCatchment', d)
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
