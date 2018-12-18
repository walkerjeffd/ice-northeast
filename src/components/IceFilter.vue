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
import { throttle } from 'throttle-debounce'

import evt from '@/event-bus'
import { getData, addDim, removeDim } from '@/store'
import variableMixin from '@/mixins/variable'

export default {
  props: ['variable', 'width'],
  mixins: [variableMixin],
  data () {
    return {
      chart: null,
      range: null,
      meanValue: null,
      margin: {
        top: 10, right: 20, bottom: 20, left: 20
      },
      height: 100,
      extent: [-Infinity, Infinity]
    }
  },
  computed: {
    xScale () {
      // console.log(`filter(${this.variable.id}):computed xScale`)
      return d3.scaleLinear()
        .domain(this.variable.scale.domain)
        .rangeRound([0, +this.width])
    },
    axis () {
      // console.log(`filter(${this.variable.id}):computed axis`)
      return d3.axisBottom(this.xScale)
    }
  },
  filters: {
    textFormat: (value, format) => d3.format(format)(value)
  },
  created () {
    const interval = (this.variable.scale.domain[1] - this.variable.scale.domain[0]) / 40

    this.yScale = d3.scaleLinear().range([100, 0])
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

    this.extent = [
      this.dim.bottom(1)[0][this.variable.id],
      this.dim.top(1)[0][this.variable.id]
    ]
  },
  mounted () {
    // console.log(`filter(${this.variable.id}):mounted`)

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

    if (this.extent[0] < this.xScale.domain()[0]) {
      const tick = this.svg.select('g.tick text')
      if (tick.datum() === this.xScale.domain()[0]) {
        tick.text(`< ${tick.text()}`)
      }
    }
    if (this.extent[1] > this.xScale.domain()[1]) {
      const ticks = this.svg.selectAll('g.tick text')
        .filter(function () { // eslint-disable-line func-names
          return d3.select(this).text() !== ''
        })
      const tick = d3.select(ticks.nodes()[ticks.size() - 1])
      if (tick.datum() === this.xScale.domain()[1]) {
        tick.text(`> ${tick.text()}`)
      }
    }

    this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height]])
      .on('start brush end', () => {
        const s = d3.event.selection
        // console.log(`filter(${this.variable.id}):on(brush)`, s)

        if (s == null) {
          this.handle.attr('display', 'none')
          this.svg.select(`#clip-${this.variable.id} rect`)
            .attr('x', null)
            .attr('width', '100%')
        } else {
          this.handle.attr('display', null)
            .attr('transform', (d, i) => `translate(${s[i]}, ${-1 * (100 / 4)})`)
          this.svg.select(`#clip-${this.variable.id} rect`)
            .attr('x', s[0])
            .attr('width', s[1] - s[0])
        }

        setFilterRange(s)
      })

    const gBrush = g.append('g').attr('class', 'brush').call(this.brush)

    this.handle = gBrush.selectAll('.handle--custom')
      .data([{ type: 'w' }, { type: 'e' }])
      .enter()
      .append('path')
      .attr('class', 'handle--custom')
      .attr('stroke', '#000')
      .attr('cursor', 'ew-resize')
      .attr('d', (d) => {
        const e = +(d.type === 'e')
        const x = e ? 1 : -1
        const y = this.height / 2
        return 'M' + (0.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) + 'V' + (2 * y - 6) + 'A6,6 0 0 ' + e + ' ' + (0.5 * x) + ',' + (2 * y) + 'Z' + 'M' + (2.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8) + 'M' + (4.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8)
      })
      .attr('display', 'none')

    const setFilterRange = throttle(100, (s) => {
      // console.log(`filter(${vm.variable.id}):setFilterRange`, s)
      if (s === null) {
        this.dim.filterAll()
        this.range = null
      } else {
        const extent = s.map(this.xScale.invert)

        if (extent[0] === this.xScale.domain()[0]) {
          extent[0] = this.extent[0]
        }

        if (extent[1] === this.xScale.domain()[1]) {
          extent[1] = this.extent[1]
        } else {
          extent[1] = extent[1] * 1.0000001
        }

        this.range = extent

        this.dim.filterRange(extent)
      }

      evt.$emit('filter')
    })

    evt.$on('filter', this.render)
    this.render()
  },
  beforeDestroy () {
    evt.$off('filter', this.render)
    // this.group.dispose()
    // this.dim.filterAll().dispose()
    removeDim(this.variable.id)
    this.svg.select('g').remove()
    this.$emit('filter')
  },
  methods: {
    barPath (groups) {
      const path = []
      const n = groups.length
      let i = -1
      let d
      while (++i < n) {
        d = groups[i]
        path.push('M', this.xScale(d.key), ',', this.height, 'V', this.yScale(d.value), 'h9V', this.height)
      }
      return path.join('')
    },
    render () {
      // console.log(`filter(${this.variable.id}):render`)
      this.yScale.domain([0, this.group.top(1)[0].value])
      this.svg.select('g').selectAll('.bar').attr('d', this.barPath)
    },
    reset () {
      // console.log(`filter(${this.variable.id}):reset`)
      const gBrush = this.svg.select('g.brush')
      gBrush.call(this.brush.move, null)
      this.dim.filterAll()
      this.range = null
      evt.$emit('filter')
    },
    destroy () {
      // console.log(`filter(${this.variable.id}):destroy`)
      this.$emit('destroy', this.variable.id)
    }
  },
  destroyed () {
    // evt.$off('filter', this.render)
    // this.group.dispose()
    // this.dim.filterAll().dispose()
    // this.$emit('filter')
  }
}
</script>

<style>
.ice-filter {
  width: 430px;
  margin-top: 10px;
  margin-bottom: 0;
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
  fill: #aaa;
  stroke: none;
}

.foreground.bar {
  fill: steelblue;
  stroke: none;
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
