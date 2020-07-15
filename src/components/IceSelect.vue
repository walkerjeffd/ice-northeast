<template>
  <select :title="title" data-width="100%" v-if="grouped">
    <optgroup
      v-for="(group, index) in optionGroups"
      :key="index"
      :label="group.label">
      <option
        v-for="option in group.options"
        :key="option[valueField]"
        :value="option[valueField]">
        {{option[textField]}}
      </option>
    </optgroup>
  </select>
  <select :title="title" data-width="100%" v-else>
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
  props: {
    id: {
      type: String,
      required: false,
      default: 'select'
    },
    config: {
      type: Object,
      required: false,
      default: () => ({})
    },
    options: {
      type: Array,
      required: false,
      default: () => []
    },
    value: {
      required: true
    },
    textField: {
      type: String,
      required: false,
      default: 'label'
    },
    valueField: {
      type: String,
      required: false,
      default: 'id'
    },
    title: {
      type: String,
      required: false,
      default: 'Select an option...'
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    grouped: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  watch: {
    value (value) {
      $(this.$el).selectpicker('val', value).selectpicker('refresh')
    }
  },
  computed: {
    optionGroups () {
      return this.options.reduce((groups, option) => {
        const groupLabel = option.group
        let group = groups.find(d => d.label === groupLabel)

        if (!group) {
          group = {
            label: groupLabel,
            options: []
          }
          groups.push(group)
        }

        group.options.push(option)

        return groups
      }, [])
    }
  },
  mounted () {
    const $el = $(this.$el)
    $el
      .attr('multiple', this.multiple)
      .selectpicker(this.config)
      .on('loaded.bs.select', () => {
        $el.selectpicker('val', this.value).selectpicker('refresh')
      })
      .on('changed.bs.select', (e, clickedIndex, isSelected, previousValue) => {
        if (isFinite(clickedIndex) && clickedIndex !== null) {
          console.log(`changed.bs.select(${this.id})`, e, clickedIndex, isSelected, previousValue, $el.selectpicker('val'))
          this.$emit('input', $el.selectpicker('val'))
        }
      })
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
