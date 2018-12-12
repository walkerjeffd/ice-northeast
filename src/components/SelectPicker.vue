<template>
  <select :title="title" data-width="100%">
    <option
      v-if="!groups"
      v-for="option in options"
      :key="option[valueField]"
      :value="option[valueField]">
      {{option[textField]}}
    </option>
    <optgroup
      v-if="groups"
      v-for="(optGroup, groupIndex) in optGroups"
      :key="groupIndex"
      :label="optGroup.label">
      <option
        v-for="option in optGroup.options"
        :key="option[valueField]"
        :value="option[valueField]">
        {{option[textField]}}
      </option>
    </optgroup>
  </select>
</template>

<script>
import { mapGetters } from 'vuex'
import 'bootstrap-select/dist/css/bootstrap-select.min.css'

const $ = require('jquery')
require('bootstrap')
require('bootstrap-select')

export default {
  props: ['config', 'options', 'value', 'textField', 'valueField', 'title', 'multiple', 'groups'],
  watch: {
    value (value) {
      $(this.$el).selectpicker('val', value).selectpicker('refresh')
    }
  },
  computed: {
    ...mapGetters(['variableById']),
    optGroups () {
      let result = null
      if (this.groups) {
        result = this.groups.map(group => ({
          label: group.label,
          options: group.variables.map(id => this.variableById(id))
        }))
      }
      return result
    }
  },
  mounted () {
    const vm = this
    $(this.$el)
      .attr('multiple', this.multiple)
      .selectpicker(this.config)
      .on('loaded.bs.select', function onLoad () {
        $(this).selectpicker('val', this.value)
      })
      .on('changed.bs.select', function onChange () {
        vm.$emit('input', $(this).selectpicker('val'))
      })
    if (this.value) {
      $(this.$el).selectpicker('val', this.value).selectpicker('refresh')
    }
  },
  updated () {
    $(this.$el).selectpicker('val', this.value).selectpicker('refresh')
  },
  destroyed () {
    $(this.$el).off().selectpicker('destroy')
  }
}

</script>

<style>
.dropdown-toggle {
  font-size: 12px;
}
.dropdown-menu {
  font-size: 12px;
}
</style>
