import * as d3 from 'd3'

export default {
  computed: {
    valueFormat () {
      const format = this.variable ? this.variable.formats.value : '.1f'
      return d3.format(format)
    },
    axisFormat () {
      const format = this.variable ? this.variable.formats.axis : '.1f'
      return d3.format(format)
    }
  }
}
