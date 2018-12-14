<template>
  <div class="ice-filter">
    <div class="title">
      <div class="pull-right">
        <button class="btn btn-xs" @click="destroy">×</button>
      </div>
      <div>{{ variable.label }}</div>
    </div>
    <div class="stats">
      <div style="display:inline;">
        Filter:
        <span v-if="range">
          <!-- {{ range[0] | textFormat(variable.formats.text) }} -
          {{ range[1] | textFormat(variable.formats.text) }} -->
          {{ range[0] }} -
          {{ range[1] }}
          <a href="#" @click.prevent="reset">(reset)</a>
        </span>
        <span v-else>None</span>
      </div>
      <!-- <div style="display:inline;float:right;">
        Mean:
        <span v-if="meanValue">
          {{ meanValue | textFormat(variable.formats.text) }}
        </span>
        <span v-else>N/A</span>
      </div> -->
    </div>
    <div class="chart"/>
  </div>
</template>

<script>
import * as d3 from 'd3'

import evt from '@/event-bus'
// import { xf, getFilteredVariableMeanValue } from '@/lib/crossfilter'
import { addDim } from '@/store'

export default {
  props: ['variable', 'width'],
  data () {
    return {
      svg: null,
      chart: null,
      dim: null,
      group: null,
      range: null,
      meanValue: null,
      margin: {
        top: 10, right: 10, bottom: 20, left: 10
      },
      height: 100,
      brush: null,
      yScale: d3.scaleLinear().range([100, 0])
    }
  },
  computed: {
    xScale () {
      return d3.scaleLinear()
        .domain(this.variable.scale.domain)
        .rangeRound([0, +this.width])
    },
    axis () {
      return d3.axisBottom(this.xScale)
    }
  },
  filters: {
    textFormat: (value, format) => d3.format(format)(value)
  },
  mounted () {
    const interval = (this.variable.scale.domain[1] - this.variable.scale.domain[0]) / 40

    this.dim = addDim(this.variable.id)
    this.group = this.dim
      .group((d) => {
        if (d >= this.variable.scale.domain[1]) {
          return this.variable.scale.domain[1] - interval
        } else if (d < this.variable.scale.domain[0]) {
          return this.variable.scale.domain[0]
        }
        return Math.floor(d / interval) * interval
      })

    this.svg = d3.select(this.$el).select('.chart').append('svg')
      .attr('width', (+this.width) + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)

    const g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    g.append('clipPath')
      .attr('id', `clip-${this.variable.id}`)
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)

    g.selectAll('.bar')
      .data(['background', 'foreground'])
      .enter().append('path')
      .attr('class', d => `${d} bar`)
      .datum(this.group.all())

    g.selectAll('.foreground.bar')
      .attr('clip-path', `url(#clip-${this.variable.id})`)

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(this.axis)

    this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height]])
      .on('start brush end', brushmoved)

    const gBrush = g.append('g').attr('class', 'brush').call(this.brush)

    const brushResizePath = (d) => {
      const e = +(d.type === 'e')
      const x = e ? 1 : -1
      const y = this.height / 2
      return 'M' + (0.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) + 'V' + (2 * y - 6) + 'A6,6 0 0 ' + e + ' ' + (0.5 * x) + ',' + (2 * y) + 'Z' + 'M' + (2.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8) + 'M' + (4.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8)
    }

    var handle = gBrush.selectAll('.handle--custom')
      .data([{ type: 'w' }, { type: 'e' }])
      .enter()
      .append('path')
      .attr('class', 'handle--custom')
      .attr('stroke', '#000')
      .attr('cursor', 'ew-resize')
      .attr('d', brushResizePath)

    const vm = this

    function brushmoved () {
      var s = d3.event.selection
      if (s == null) {
        vm.reset()
        handle.attr('display', 'none')
      } else {
        const extent = s.map(vm.xScale.invert)
        vm.range = extent
        vm.dim.filterRange([extent[0], extent[1] * 1.0000001])
        vm.$emit('brush')
        handle.attr('display', null)
          .attr('transform', (d, i) => `translate(${s[i]}, ${-1 * (100 / 4)})`)
      }
    }

    evt.$on('filter', this.render)
  },
  methods: {
    render () {
      const barPath = (groups) => {
        const path = []
        const n = groups.length
        let i = -1
        let d
        while (++i < n) {
          d = groups[i]
          path.push('M', this.xScale(d.key), ',', this.height, 'V', this.yScale(d.value), 'h9V', this.height)
        }
        return path.join('')
      }

      this.yScale.domain([0, this.group.top(1)[0].value])

      this.svg.select('g').selectAll('.bar').attr('d', barPath)
    },
    reset () {
      this.dim.filterAll()
      this.range = null
      this.$emit('brush')
    },
    destroy () {
      this.$emit('destroy', this.variable.id)
    }
  },
  destroyed () {
    evt.$off('filter', this.render)
    this.group.dispose()
    this.dim.filterAll().dispose()
    this.$emit('brush')
  }
}

// function barChart (id) {
//   const axis = d3.axisBottom()
//   const brush = d3.brush()

//   let margin = {
//     top: 10, right: 10, bottom: 20, left: 10
//   }
//   let y = d3.scaleLinear().range([100, 0])
//   let x
//   let brushDirty
//   let dimension
//   let group
//   let round
//   let meanValue = null
//   let onBrush = () => {}

//   function chart (div) {
//     const width = x.range()[1]
//     const height = y.range()[0]

//     y.domain([0, group.top(1)[0].value])

//     function barPath (groups) {
//       const path = []
//       const n = groups.length
//       let i = -1
//       let d
//       while (++i < n) { // eslint-disable-line no-plusplus
//         d = groups[i]
//         path.push('M', x(d.key), ',', height, 'V', y(d.value), 'h9V', height)
//       }
//       return path.join('')
//     }

//     function resizePath (d) {
//       const e = +(d === 'e')
//       const x = e ? 1 : -1 // eslint-disable-line no-shadow
//       const y = height / 3 // eslint-disable-line no-shadow

//       // eslint-disable-next-line prefer-template
//       return 'M' + (0.5 * x) + ',' + y
//         + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6)
//         + 'V' + ((2 * y) - 6)
//         + 'A6,6 0 0 ' + e + ' ' + (0.5 * x) + ',' + (2 * y)
//         + 'Z'
//         + 'M' + (2.5 * x) + ',' + (y + 8)
//         + 'V' + ((2 * y) - 8)
//         + 'M' + (4.5 * x) + ',' + (y + 8)
//         + 'V' + ((2 * y) - 8)
//     }

//     div.each(function eachDiv () {
//       const div = d3.select(this) // eslint-disable-line no-shadow
//       let g = div.select('g')

//       // Create the skeletal chart.
//       if (g.empty()) {
//         g = div.append('svg')
//           .attr('width', width + margin.left + margin.right)
//           .attr('height', height + margin.top + margin.bottom)
//           .append('g')
//           .attr('transform', `translate(${margin.left},${margin.top})`)

//         g.append('clipPath')
//           .attr('id', `clip-${id}`)
//           .append('rect')
//           .attr('width', width)
//           .attr('height', height)

//         g.selectAll('.bar')
//           .data(['background', 'foreground'])
//           .enter().append('path')
//           .attr('class', d => `${d} bar`)
//           .datum(group.all())

//         g.selectAll('.foreground.bar')
//           .attr('clip-path', `url(#clip-${id})`)

//         g.append('g')
//           .attr('class', 'axis')
//           .attr('transform', `translate(0,${height})`)
//           .call(axis)

//         // Initialize the brush component with pretty resize handles.
//         const gBrush = g.append('g').attr('class', 'brush').call(brush)
//         gBrush.selectAll('rect').attr('height', height)
//         gBrush.selectAll('.resize').append('path').attr('d', resizePath)
//       }

//       // Only redraw the brush if set externally.
//       if (brushDirty) {
//         brushDirty = false
//         g.selectAll('.brush').call(brush)
//         div.select('.title a').style('display', brush.empty() ? 'none' : null)
//         if (brush.empty()) {
//           g.selectAll(`#clip-${id} rect`)
//             .attr('x', 0)
//             .attr('width', width)
//         } else {
//           const extent = brush.extent()
//           g.selectAll(`#clip-${id} rect`)
//             .attr('x', x(extent[0]))
//             .attr('width', x(extent[1]) - x(extent[0]))
//         }
//       }

//       g.selectAll('.bar').attr('d', barPath)

//       if (meanValue != null) {
//         const meanLine = g.selectAll('.mean')
//           .data([meanValue])
//         meanLine.enter()
//           .append('line')
//           .attr('class', 'mean')
//           .attr('y1', y.range()[0])
//           .attr('y2', y.range()[1])
//         meanLine
//           .style('display', null)
//           .attr('x1', d => x(d))
//           .attr('x2', d => x(d))
//       } else {
//         g.selectAll('.mean').style('display', 'none')
//       }
//     })
//   }

//   brush.on('start', function () {
//     const div = d3.select(this.parentNode.parentNode.parentNode)
//     div.select('.title a').style('display', null)
//   })

//   brush.on('brush', function () {
//     const g = d3.select(this.parentNode)
//     let extent = brush.extent()

//     if (round) {
//       g.select('.brush')
//         .call(brush.extent(extent = extent.map(round)))
//         .selectAll('.resize')
//         .style('display', null)
//     }
//     g.select(`#clip-${id} rect`)
//       .attr('x', x(extent[0]))
//       .attr('width', x(extent[1]) - x(extent[0]))
//     dimension.filterRange([extent[0], extent[1] * 1.0000001])
//     onBrush(extent)
//   })

//   brush.on('brush', function () {
//     if (brush.empty()) {
//       const div = d3.select(this.parentNode.parentNode.parentNode)
//       div.select('.title a').style('display', 'none')
//       div.select(`#clip-${id} rect`).attr('x', null).attr('width', '100%')
//       dimension.filterAll()
//       onBrush(null)
//     }
//   })

//   chart.margin = function (_) {
//     if (!arguments.length) return margin
//     margin = _
//     return chart
//   }

//   chart.x = function (_) {
//     if (!arguments.length) return x
//     x = _
//     axis.scale(x)
//     brush.x(x)
//     return chart
//   }

//   chart.y = function (_) {
//     if (!arguments.length) return y
//     y = _
//     return chart
//   }

//   chart.dimension = function (_) {
//     if (!arguments.length) return dimension
//     dimension = _
//     return chart
//   }

//   chart.filter = function (_) {
//     if (_) {
//       brush.extent(_)
//       dimension.filterRange([_[0], _[1] * 1.0000001])
//     } else {
//       brush.clear()
//       dimension.filterAll()
//     }
//     brushDirty = true
//     return chart
//   }

//   chart.group = function (_) {
//     if (!arguments.length) return group
//     group = _
//     return chart
//   }

//   chart.round = function (_) {
//     if (!arguments.length) return round
//     round = _
//     return chart
//   }

//   chart.meanValue = function (_) {
//     if (!arguments.length) return meanValue
//     meanValue = _
//     return chart
//   }

//   chart.getExtent = () => brush.extent()

//   chart.onBrush = function (_) {
//     if (!arguments.length) return onBrush
//     onBrush = _
//     return chart
//   }

//   return d3.rebind(chart, brush, 'on')
// }

</script>

<style>
.ice-filter {
  width: 430px;
  margin-top: 10px;
  margin-bottom: 0;
}

.ice-filter hr {
  margin-top: 10px;
  margin-bottom: 10px;
}

.ice-filter .title {
  font-weight: bold;
  font-size: 0.9em;
  min-height: 23px;
}

.ice-filter .stats {
  font-size: 0.9em;
}

.chart {
  display: inline-block;
  height: 130px;
  margin-bottom: 10px;
}

.reset {
  padding-left: 1em;
  font-size: smaller;
  color: #ccc;
}

.background.bar {
  fill: #ccc;
}

.foreground.bar {
  fill: steelblue;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.axis text {
  font: 10px sans-serif;
}

.brush rect.extent {
  fill: steelblue;
  fill-opacity: .125;
}

.brush .resize path {
  fill: #eee;
  stroke: #666;
}

line.mean {
  stroke: rgb(76, 174, 255);
  stroke-width: 2px;
}
</style>
