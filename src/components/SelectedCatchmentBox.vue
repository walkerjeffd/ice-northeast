<template>
  <div>
    <div class="ice-info-box text-right">
      <div class="ice-info-box-title">
        <strong>Selected Catchment:</strong> {{ selected.id }}
      </div>

      <div class="ice-info-box-body">
        <button class="btn btn-default btn-xs" @click="showData = true">
          <i class="fa fa-table"></i> Data
        </button>
        <button class="btn btn-default btn-xs" @click="zoomTo">
          <i class="fa fa-search-plus"></i> Zoom To
        </button>
        <button class="btn btn-default btn-xs" @click="unselect">
          <i class="fa fa-times-circle"></i> Unselect
        </button>
      </div>
    </div>
    <ice-modal :show="showData" @close="showData = false">
      <span slot="title">Selected Catchment ({{ selected.id }})</span>
      <div slot="body">
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
        const datum = xf.subset.all().find(d => d.id == this.selected.id)
        rows = this.variables
          .filter(d => d.map || d.filter)
          .map(d => {
            const value = datum[d.id]
            const formatter = d3.format(d.formats.value)
            return {
              id: d.id,
              label: d.label,
              format: d.formats.value,
              value,
              formattedValue: value === null ? 'N/A' : formatter(value)
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
    }
  }
}
</script>

<style scoped>
.ice-info-box {
  position: absolute;
  right: 490px;
  top: 135px;
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
