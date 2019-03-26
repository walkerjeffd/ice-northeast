<template>
  <div>
    <div class="ice-info-box text-right">
      <div class="ice-info-box-title">
        <strong>Selected {{ theme.label }}:</strong> - {{ selected.properties.name }} ({{ selected.id }})
      </div>

      <div class="ice-info-box-body">
        <button class="btn btn-default btn-xs" @click="showData = true">
          <i class="fa fa-table"></i> Data
        </button>
        <button class="btn btn-default btn-xs" @click="zoomTo">
          <i class="fa fa-search-plus"></i> Zoom To
        </button>
        <button class="btn btn-default btn-xs" @click="showCatchments">
          <i class="fa fa-plus-circle"></i> Catchments
        </button>
        <button class="btn btn-default btn-xs" @click="unselect">
          <i class="fa fa-times-circle"></i> Unselect
        </button>
      </div>
    </div>
    <ice-modal :show="showData" @close="showData = false">
      <span slot="title"><strong>{{ theme.label }}: {{ selected.properties.name }} ({{ selected.id }})</strong></span>
      <div slot="body">
        <p>This table lists the area-weighted mean value of all catchments within the selected HUC. These values are <em>not</em> affected by current filters.</p>
        <table class="table table-condensed table-striped" v-if="dataRows.length > 0">
          <thead>
            <th>Variable</th>
            <th>Value</th>
          </thead>
          <tbody>
            <tr v-for="row in dataRows" :key="row.id">
              <td>{{row.label}}</td>
              <td>{{row.formattedValue}}</td>
            </tr>
          </tbody>
        </table>        
      </div>
    </ice-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as d3 from 'd3'

import { IceModal, xf } from 'ice-components'

export default {
  components: { IceModal },
  props: ['selected'],
  data () {
    return {
      showData: false,
      dataRows: []
    }
  },
  computed: {
    ...mapGetters(['variables', 'theme'])
  },
  watch: {
    showData () {
      let rows = []
      if (this.showData) {
        const data = xf.subset.all()
        rows = this.variables
          .filter(d => d.map || d.filter)
          .map(d => {
            const values = data.map(v => ({
              weight: v[this.theme.group.weight],
              value: v[d.id],
              weightedValue: v[this.theme.group.weight] * v[d.id]
            })).filter(v => v.value !== null)

            const value = d3.sum(values.map(v => v.weightedValue)) / d3.sum(values.map(v => v.weight))
            const formatter = d3.format(d.formats.value)
            return {
              id: d.id,
              label: d.label,
              n: values.length,
              format: d.formats.value,
              value,
              formattedValue: formatter(value)
            }
          })
      }

      this.dataRows = rows
    }
  },
  methods: {
    unselect () {
      this.$emit('unselect')
    },
    zoomTo () {
      this.$emit('zoomTo', this.selected)
    },
    showCatchments () {
      // console.log('info:showCatchments')
      this.$emit('showCatchments', this.selected)
    }
  }
}
</script>

<style>
.ice-info-box {
  position: absolute;
  right: 490px;
  top: 70px;
  padding: 5px 5px;
  background: #fff;
  font-size: 12px;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.4);
  z-index: 3000;
}

.ice-info-box-title {
  font-size: 1.2em;
}

.ice-info-box-body {
  width: 100%;
  margin-top: 5px;
}
</style>
