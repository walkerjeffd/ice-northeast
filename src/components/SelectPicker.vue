<template>
  <select :title="title" data-width="100%">
    <option
      v-for="option in options"
      :key="option[valueField]"
      :value="option[valueField]">
      {{option[textField]}}
    </option>
  </select>
</template>

<script>
import 'bootstrap-select/dist/css/bootstrap-select.min.css'

const $ = require('jquery')
require('bootstrap')
require('bootstrap-select')

export default {
  props: ['id', 'config', 'options', 'value', 'textField', 'valueField', 'title', 'multiple', 'groups'],
  watch: {
    value (value) {
      $(this.$el).selectpicker('val', value).selectpicker('refresh')
    }
  },
  mounted () {
    const $el = $(this.$el)
    $el
      .attr('multiple', this.multiple)
      .selectpicker(this.config)
      .on('loaded.bs.select', () => $el.selectpicker('val', this.value).selectpicker('refresh'))
      .on('changed.bs.select', () => this.$emit('input', $el.selectpicker('val')))
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
