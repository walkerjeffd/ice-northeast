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
      <div style="display:inline;float:right;text-align:right">
        Mean:
        {{ meanText.all }} (<svg style="vertical-align:middle" width="12" height="12"><line x1="6" y1="0" x2="6" y2="12" class="mean-all"></line></svg>)<br>
        <span v-if="hasSubset">
          {{ meanText.subset }} (<svg style="vertical-align:middle" width="12" height="12"><line x1="6" y1="0" x2="6" y2="12" class="mean-subset"></line></svg>)
        </span>
      </div>
    </div>
    <div class="chart"/>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { throttle } from 'throttle-debounce'

import evt from '@/events'
import { VariableMixin } from '@/mixins/index'
import { xf } from '@/libs/IceCrossfilter'

export default {
  props: {
    variable: {
      type: Object,
      required: true
    },
    width: {
      type: Number,
      required: false,
      default: 360
    },
    meanLine: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  mixins: [VariableMixin],
  data () {
    return {
      chart: null,
      range: null,
      mean: {
        value: null,
        text: null
      },
      margin: {
        top: 10, right: 20, bottom: 20, left: 20
      },
      height: 100,
      extent: [-Infinity, Infinity],
      hasSubset: false,
      meanText: {
        all: 'N/A',
        subset: 'N/A'
      }
    }
  },
  computed: {
    xScale () {
      // .log(`filter(${this.variable.id}):computed xScale`)
      return d3.scaleLinear()
        .domain(this.variable.scale.domain)
        .rangeRound([0, +this.width])
    },
    axis () {
      // console.log(`filter(${this.variable.id}):computed axis`)
      return d3.axisBottom(this.xScale).tickFormat(this.axisFormat)
    }
  },
  created () {
    const interval = (this.variable.scale.domain[1] - this.variable.scale.domain[0]) / 40

    this.yScale = d3.scaleLinear().range([100, 0])

    const dimFunction = d => (d[this.variable.id] === null ? -Infinity : d[this.variable.id])
    const groupFunction = (d) => {
      if (d === -Infinity) {
        return -Infinity
      } else if (d >= this.variable.scale.domain[1]) {
        return this.variable.scale.domain[1] - interval
      } else if (d < this.variable.scale.domain[0]) {
        return this.variable.scale.domain[0]
      }
      return Math.floor(d / interval) * interval
    }
    this.all = {
      dim: xf.all.dimension(dimFunction),
      mean: {}
    }
    this.all.group = this.all.dim.group(groupFunction)
    this.all.mean.dim = xf.all.dimension(dimFunction)
    this.all.mean.group = this.all.mean.dim
      .groupAll()
      .reduce(
        (p, v) => {
          if (v[this.variable.id] === null) return p
          p.count += 1
          p.sum += v[this.variable.id]
          return p
        },
        (p, v) => {
          if (v[this.variable.id] === null) return p
          p.count -= 1
          p.sum -= v[this.variable.id]
          return p
        },
        () => {
          return {
            count: 0,
            sum: 0
          }
        }
      )

    this.subset = {
      dim: xf.subset.dimension(dimFunction),
      mean: {}
    }
    this.subset.group = this.subset.dim.group(groupFunction)
    this.subset.mean.dim = xf.subset.dimension(dimFunction)
    this.subset.mean.group = this.subset.mean.dim
      .groupAll()
      .reduce(
        (p, v) => {
          if (v[this.variable.id] === null) return p
          p.count += 1
          p.sum += v[this.variable.id]
          return p
        },
        (p, v) => {
          if (v[this.variable.id] === null) return p
          p.count -= 1
          p.sum -= v[this.variable.id]
          return p
        },
        () => {
          return {
            count: 0,
            sum: 0
          }
        }
      )

    const data = xf.all.all().filter(d => d[this.variable.id] !== null)
    this.extent = d3.extent(data, d => d[this.variable.id])
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

    g.selectAll('.bar.all')
      .data(['background', 'foreground'])
      .enter().append('path')
      .attr('class', d => `${d} bar all`)

    g.selectAll('.bar.subset')
      .data(['background', 'foreground'])
      .enter().append('path')
      .attr('class', d => `${d} bar subset`)

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
      // .on('start brush end', () => {
      .on('brush end', () => {
        // console.log(`filter(${this.variable.id}):on(brush)`, d3.event.selection, d3.event.type)
        const s = d3.event.selection

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

        if (s === null) {
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
        }

        setFilters()

        if (this.range || (d3.event.type === 'end')) evt.$emit('filter:render')
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

    const setFilters = throttle(100, () => {
      // console.log(`filter(${this.variable.id}):setFilters`, s)
      if (this.range) {
        this.all.dim.filterRange(this.range)
        this.subset.dim.filterRange(this.range)
      } else {
        this.all.dim.filterAll()
        this.subset.dim.filterAll()
      }
    })

    evt.$on('filter:render', this.render)
    evt.$on('filter:clearSubset', this.clearSubset)
    evt.$on('filter:set', setFilters)

    this.render()
  },
  beforeDestroy () {
    // console.log(`filter(${this.variable.id}):beforeDestroy`)
    evt.$off('filter:render', this.render)
    this.all.dim.filterAll().dispose()
    this.subset.dim.filterAll().dispose()
    this.all.mean.dim.dispose()
    this.svg.select('g').remove()
    evt.$emit('filter:render')
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
      // console.log(`filter(${this.variable.id}):render`, this.range)
      const g = this.svg.select('g')

      const allGroupMax = this.all.group.top(2)
        .filter(d => d.key > -Infinity)[0]
      this.yScale.domain([0, allGroupMax.value])
      g.selectAll('.bar.all')
        .datum(this.all.group.all().filter(d => d.key > -Infinity))
        .attr('d', this.barPath)

      if (xf.subset.size() > 0) {
        const subsetGroupMax = this.subset.group.top(2)
          .filter(d => d.key > -Infinity)[0]

        this.yScale.domain([0, subsetGroupMax.value])
        g.selectAll('.bar.subset')
          .datum(this.subset.group.all().filter(d => d.key > -Infinity))
          .attr('d', this.barPath)
        this.hasSubset = true
      } else {
        g.selectAll('.bar.subset')
          .datum([])
          .attr('d', this.barPath)
        this.hasSubset = false
      }

      const allMean = this.all.mean.group.value()
      this.all.mean.value = allMean.count > 0 ? allMean.sum / allMean.count : null
      this.meanText.all = this.all.mean.value === null ? 'N/A' : this.valueFormat(this.all.mean.value)

      const subsetMean = this.subset.mean.group.value()
      this.subset.mean.value = subsetMean.count > 0 ? subsetMean.sum / subsetMean.count : null
      this.meanText.subset = this.subset.mean.value === null ? 'N/A' : this.valueFormat(this.subset.mean.value)

      if (this.meanLine) {
        const allLine = g.selectAll('.mean-all')
          .data(this.all.mean.value === null ? [] : [this.all.mean.value])

        allLine
          .enter()
          .append('line')
          .attr('class', 'mean-all')
          .style('stroke', 'rgb(76, 174, 255)')
          .style('stroke-width', '2px')
          .attr('y1', this.yScale.range()[0])
          .attr('y2', this.yScale.range()[1])
          .merge(allLine)
          .attr('x1', this.xScale)
          .attr('x2', this.xScale)

        allLine.exit().remove()

        const subsetLine = g.selectAll('.mean-subset')
          .data(this.subset.mean.value === null ? [] : [this.subset.mean.value])

        subsetLine
          .enter()
          .append('line')
          .attr('class', 'mean-subset')
          // .style('stroke', 'rgb(76, 174, 255)')
          // .style('stroke-width', '2px')
          .attr('y1', this.yScale.range()[0])
          .attr('y2', this.yScale.range()[1])
          .merge(subsetLine)
          .attr('x1', this.xScale)
          .attr('x2', this.xScale)

        subsetLine.exit().remove()
      }
    },
    reset () {
      // console.log(`filter(${this.variable.id}):reset`)
      const gBrush = this.svg.select('g.brush')
      gBrush.call(this.brush.move, null)
    },
    destroy () {
      // console.log(`filter(${this.variable.id}):destroy`)
      this.$emit('destroy', this.variable.id)
    },
    clearSubset () {
      // console.log(`filter(${this.variable.id}):clearSubset`)
      this.subset.dim.filterAll()
      xf.subset.remove()
    }
  }
}
</script>

<style>
.ice-filter {
  width: 455px;
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

.bar {
  stroke: none;
}

.background.bar {
  fill: #999;
}

.background.bar.subset {
  fill: #AAA;
  opacity: 0.6;
}

.foreground.bar.all {
  fill: steelblue;
}

.foreground.bar.subset {
  fill: orangered;
  opacity: 0.6;
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

line.mean-all {
  stroke: rgb(76, 174, 255);
  stroke-width: 2px;
}

line.mean-subset {
  stroke: rgb(255, 116, 64);
  stroke-width: 2px;
}
</style>
