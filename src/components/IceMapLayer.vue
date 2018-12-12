<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import * as topojson from 'topojson-client'

import evt from '@/event-bus'

export default {
  name: 'IceMapLayer',
  props: ['setBounds', 'layer', 'getColor', 'getValue'],
  mounted () {
    evt.$on('map:zoom', this.resize)
    evt.$on('map:render', this.render)

    this.svg.call(this.tip)
  },
  data () {
    return {
      layerData: null,
      tip: d3Tip()
        .attr('class', 'd3-tip')
    }
  },
  computed: {
    ...mapGetters(['theme', 'variable']),
    features () {
      return this.layerData ? this.layerData.features : []
    },
    path () {
      const map = this.map
      function projectPoint (x, y) {
        const point = map.latLngToLayerPoint(new L.LatLng(y, x))
        this.stream.point(point.x, point.y)
      }
      const transform = d3.geoTransform({ point: projectPoint })
      return d3.geoPath().projection(transform)
    },
    svg () {
      return this.$parent.svg
    },
    map () {
      return this.$parent.map
    }
  },
  watch: {
    variable () {
      this.tip.html(d => `
        <strong>${this.theme.label} ID:</strong> ${d.id}<br>
        <strong>${this.variable.label}:</strong> ${this.getValue(d) ? this.getValue(d).toFixed(2) : 'N/A'}
      `)
    },
    layer () {
      if (!this.layer) return

      return this.loadLayer(this.layer)
    }
  },
  methods: {
    loadLayer (layer) {
      if (!layer) return
      return axios.get(`${layer.url}`)
        .then(response => response.data)
        .then((data) => {
          let geoJson = data
          if (layer.type === 'topojson') {
            geoJson = topojson.feature(data, data.objects[layer.object])
          }

          this.layerData = geoJson

          this.resize()

          this.svg
            .select('g')
            .selectAll('path')
            .remove()

          this.render()
        })
    },
    resize () {
      if (this.setBounds) {
        const bounds = this.path.bounds(this.layerData)
        this.$parent.$emit('resize', bounds)
      }

      this.render()
    },
    render () {
      if (!this.features || this.features.length === 0) return

      const tip = this.tip

      const paths = this.svg
        .select('g')
        .selectAll('path')
        .data(this.features, d => d.id)

      paths.enter()
        .append('path')
        .style('cursor', 'pointer')
        .style('pointer-events', 'visible')
        .on('click', (d) => (!this.$parent.disableClick && this.$emit('click', d)))
        .on('mouseenter', function (d) {
          this.parentNode.appendChild(this) // move to front
          d3.select(this)
            .style('stroke', 'white')
            .style('stroke-width', '1')
          tip.show(d, this)
        })
        .on('mouseout', function (d) {
          d3.select(this)
            .style('stroke', null)
            .style('stroke-width', null)
          tip.hide(d, this)
        })
        .merge(paths)
        .attr('d', this.path)
        .style('fill', this.getColor)

      paths.exit().remove()
    }
  },
  render: function (h) {
    return null
  }
}
</script>

<style>
/*
  d3-tip -----------------------------------------------------------
  https://rawgit.com/Caged/d3-tip/master/examples/example-styles.css
*/
.d3-tip {
  line-height: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #000;
  border-radius: 2px;
  pointer-events: none;
  font-family: sans-serif;
  z-index: 1000;
}
</style>
