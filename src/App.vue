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
                :options="mapVariables"
                :value="selected.variable"
                :multiple="false"
                @input="selectVariable"
                value-field="id"
                text-field="label"
                title="Select variable..."
              />
            </div>
          </div>
        </div>
        <div class="ice-box">
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
        </div>
        <div class="ice-box">
          <div class="row">
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
      <ice-map :options="map.options">
        <ice-map-layer
          :layer="layer"
          :set-bounds="true"
          :get-color="getColor"
          :get-value="getValue"
          @click="selectFeature" />
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
import SelectPicker from './components/SelectPicker.vue'
import { getGroupByKey, addDim, getDim, removeDim } from '@/store'

export default {
  name: 'app',
  components: {
    IceHeader,
    IceMap,
    IceMapLayer,
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
        color: 'YlGnBu',
        transform: 'linear',
        states: ['CT', 'DE', 'DC', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT', 'VA', 'WV']
      }
    }
  },
  computed: {
    ...mapGetters(['themes', 'layer', 'variables', 'variable']),
    mapVariables () {
      return this.variables.filter(v => v.map)
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
        addDim('state')
        const theme = config.themes.find(d => d.default)
        return this.selectTheme(theme.id)
      })
  },
  methods: {
    selectColor (color) {
      this.selected.color = color
      evt.$emit('map:render')
    },
    selectStates (states) {
      this.selected.states = states
      getDim('state').filterFunction(d => states.includes(d))
      evt.$emit('map:render')
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
            const variable = this.mapVariables.find(d => d.default)
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
      console.log('selectFeature', feature.id, getGroupByKey(feature.id))
    },
    getColor (feature) {
      const value = this.getValue(feature)
      const scaled = value !== null ? this.variableScale(value) : null
      const color = scaled !== null ? this.colorScale(scaled) : '#CCCCCC'
      return color
    },
    getValue (feature) {
      const group = getGroupByKey(feature.id)
      return group ? group.mean : null
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

.ice-box-label {
  font-weight: bold;
  font-size: 1.1em;
  font-variant: small-caps;
  text-align: right;
  margin-top: 5px
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
