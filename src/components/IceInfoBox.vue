<template>
  <div>
    <div class="ice-info-box text-right">
      <div class="ice-info-box-title">
        <strong>Selected:</strong> {{ getLabel(selected) }}
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
    <modal :show="showData" @close="showData = false">
      <span slot="title">Selected Feature</span>
      <div slot="body">
        <p>
          <strong>ID: {{ selected.id }}</strong>
        </p>
        <hr>
        <!-- <div v-for="(table, index) in tables" :key="index">
          <strong>{{ table.label }}</strong>
          <table class="table table-condensed table-striped" style="width:100%">
            <tbody>
              <tr v-for="(row, index) in table.rows" :key="index">
                <td class="col-md-10">{{ row.label }}</td>
                <td class="col-md-2 text-right">{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div> -->
      </div>
    </modal>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
// import * as d3 from 'd3'

import Modal from '@/components/Modal'
// import { valuesById } from '@/lib/crossfilter'

export default {
  components: { Modal },
  props: ['selected', 'getLabel'],
  data () {
    return {
      showData: false
    }
  },
  computed: {
    // ...mapGetters(['variables', 'variableGroups', 'variableById', 'theme']),
    // values () {
    //   return valuesById(this.selected.properties.id)
    // },
    // label () {
    //   return this.values.label
    // },
    // area () {
    //   return d3.format(',.1f')(this.values[this.theme.dataset.columns.area])
    // },
    // tables () {
    //   return this.variableGroups.map((group) => {
    //     const rows = []
    //     group.variables.forEach((variableId) => {
    //       const variable = this.variableById(variableId)
    //       const value = this.values[variable.id] === null ? 'N/A' : d3.format(variable.formats.text)(this.values[variable.id])
    //       rows.push({
    //         label: variable.label,
    //         value
    //       })
    //     })
    //     return {
    //       label: group.label,
    //       rows
    //     }
    //   })
    // }
  },
  methods: {
    unselect () {
      this.$emit('unselect')
    },
    zoomTo () {
      this.$emit('zoomTo', this.selected)
    },
    showCatchments () {
      console.log('info:showCatchments')
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
