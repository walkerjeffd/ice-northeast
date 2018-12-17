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
          {{ range[1] | textFormat(variable.formats.text) }} -->
          {{ valueFormat(range[0]) }} -
          {{ valueFormat(range[1]) }}
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
import { addDim } from '@/store'
import variableMixin from '@/mixins/variable'

export default {
  props: ['variable', 'width'],
  mixins: [variableMixin],
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
