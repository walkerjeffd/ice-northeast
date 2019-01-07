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
    <ice-modal :show="showData" @close="showData = false">
      <span slot="title">Selected Feature</span>
      <div slot="body">
        <p>
          <strong>ID: {{ selected.id }}</strong>
        </p>
      </div>
    </ice-modal>
  </div>
</template>

<script>
import { IceModal } from 'ice-components'

export default {
  components: { IceModal },
  props: ['selected', 'getLabel'],
  data () {
    return {
      showData: false
    }
  },
  computed: {
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
