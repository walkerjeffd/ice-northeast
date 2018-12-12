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
              <div class="ice-box-label">Variable</div>
            </div>
            <div class="col-xs-9">
              <select-picker
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
      </div>
      <ice-map :options="map.options">
        <ice-map-layer
          :layer="layer"
          :set-bounds="true"
          :color-scale="colorScale"
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

// import EventBus from './event-bus'

import IceHeader from './components/IceHeader.vue'
import IceMap from './components/IceMap.vue'
import IceMapLayer from './components/IceMapLayer.vue'
import SelectPicker from './components/SelectPicker.vue'
import { getGroupByKey } from '@/store'

const colorScale = d3.scale.linear()
  .domain([0, 0.5, 1])
  .range(['#6BB844', '#F7EB48', '#EF4545'])
  .interpolate(d3.interpolateHcl)

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
      selected: {
        theme: null,
        variable: null
      }
    }
  },
  computed: {
    ...mapGetters(['themes', 'layer', 'variables', 'variable']),
    mapVariables () {
      return this.variables.filter(v => v.map)
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
  },
  methods: {
    selectTheme (id) {
      this.loading = true
      this.$store.dispatch('selectThemeById', id)
        .then(() => {
          this.selected.theme = id

          return Promise.resolve()
        })
        .then(() => {
          // set default variable
          if (!this.selected.variable) {
            const variable = this.mapVariables.find(d => d.default)
            this.selectVariable(variable.id)
          } else {
            this.selectVariable(this.selected.variable)
          }

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
    },
    selectFeature (feature) {
      const item = getGroupByKey(feature.id)
      console.log('selectFeature', feature.id, item.value)
    },
    colorScale () {
      return colorScale(Math.random())
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
