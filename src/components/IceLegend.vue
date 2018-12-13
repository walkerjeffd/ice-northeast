<template>
  <div class="ice-legend" v-show="variable">
  </div>
</template>

<script>
import * as d3 from 'd3'

// import colorMixin from '@/mixins/color';
// import variableMixin from '@/mixins/variable';

export default {
  name: 'map-legend',
  // mixins: [colorMixin, variableMixin],
  props: ['id', 'colorScale', 'variableScale', 'variable', 'width', 'height'],
  //   id: {
  //     type: String,
  //     required: true,
  //   },
  //   height: {
  //     type: Number,
  //     default: 20,
  //     required: false,
  //   },
  //   maxWidth: {
  //     type: Number,
  //     required: false
  //   },
  //   margins: {
  //     type: Object,
  //     default() {
  //       return {
  //         left: 0,
  //         right: 0,
  //       };
  //     },
  //     required: false,
  //   },
  //   variable: {
  //     type: Object,
  //     required: true
  //   },
  //   data: {
  //     type: Array,
  //     required: true
  //   },
  //   show: {
  //     type: Boolean,
  //     required: true
  //   }
  // },
  data () {
    return {
      svg: null,
      margins: {
        left: 20,
        right: 20
      },
      axisHeight: 30
    }
  },
  //   variableScale() {
  //     return this.getVariableScale(this.variable, this.data);
  //   },
  //   colorScale() {
  //     return this.getColorScale(this.variable);
  //   }
  // },
  mounted () {
    this.svg = d3.select(this.$el).append('svg')
    this.render()
    // window.addEventListener('resize', this.render)
  },
  beforeDestroy () {
    // window.removeEventListener('resize', this.render)
  },
  watch: {
    variable (variable) {
      // console.log('legend:watch variable', variable)
      this.render()
    },
    colorScale () {
      // console.log('legend:watch colorScale')
      this.render()
    },
    variableScale () {
      // console.log('legend:watch variableScale')
      this.render()
    }
  },
  methods: {
    render () {
      this.resize()
      this.clear()
      this.renderContinuous()

      // switch (this.variable.scale.type) {
      //   case 'continuous':
      //     this.renderContinuous();
      //     break;
      //   case 'quantile':
      //     this.renderQuantile();
      //     break;
      //   default:
      //     console.log('ERROR: invalid variable scale type');
      // }
    },
    renderContinuous () {
      console.log('legend:renderContinuous')
      const defs = this.svg.append('defs')

      const linearGradient = defs.append('linearGradient')
        .attr('id', `linear-gradient-${this.id}`)

      linearGradient
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')

      this.svg.append('rect')
        .attr('width', this.width - this.margins.left - this.margins.right)
        .attr('height', this.height)
        .attr('x', this.margins.left)
        .style('fill', `url(#linear-gradient-${this.id}`)

      const delta = 0.2
      const offsets = d3.range(0, 1, delta)
      offsets.push(1)

      linearGradient.selectAll('stop')
        .data(offsets)
        .enter()
        .append('stop')
        .attr('offset', d => d)
        .attr('stop-color', d => this.colorScale(d))

      this.svg.append('g')
        .attr('class', 'legend-axis')
        .attr('transform', `translate(${this.margins.left}, ${this.height})`)

      this.renderContinuousAxis()
    },
    renderContinuousAxis () {
      console.log('legend:renderContinuousAxis')
      const axisScale = this.variableScale
        .copy()
        .rangeRound([0, +this.width - this.margins.left - this.margins.right])
      // const axisFormatter = d3.format(this.variable ? this.variable.formats.axis : ',.1f')
      const axisFormatter = d3.format(',.1f')
      const axis = d3.axisBottom(axisScale)

      axis.ticks(8, axisFormatter)
      this.svg.select('g.legend-axis')
        .call(axis)

      // if (this.variableScale.clamp() && this.variable.scale.transform) {
      //   if (this.variable.scale.transform.min) {
      //     const tick = this.svg.select('g.tick text')
      //     if (tick.datum() === this.variable.scale.transform.min) {
      //       tick.text(`< ${tick.text()}`)
      //     }
      //   }
      //   if (this.variable.scale.transform.max) {
      //     const ticks = this.svg.selectAll('g.tick text')
      //       .filter(function () { // eslint-disable-line func-names
      //         return d3.select(this).text() !== ''
      //       })
      //     const tick = d3.select(ticks.nodes()[ticks.size() - 1])
      //     if (tick.datum() === this.variable.scale.transform.max) {
      //       tick.text(`> ${tick.text()}`)
      //     }
      //   }
      // }
    },
    resize () {
      const width = this.width
      const height = this.height + this.axisHeight

      this.svg
        .attr('width', width)
        .attr('height', height)
    },
    clear () {
      this.svg.select('g.legend-axis').remove()
      this.svg.select('defs').remove()
      this.svg.selectAll('rect').remove()
    }
  }
}
</script>

<style>
.ice-legend {
  padding-top: 15px;
}

g.legend-axis.quantile path {
  display: none;
}

g.legend-axis path {
  fill: none;
}
</style>
