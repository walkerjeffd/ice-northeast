<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import d3Tip from 'd3-tip'

import VariableMixin from '@/mixins/variable'
import evt from '@/events'

export default {
  name: 'IceMapLayer',
  props: ['id', 'setBounds', 'layer', 'getFill', 'getValue', 'getLabel', 'selected'],
  mixins: [VariableMixin],
  data () {
    return {
      data: null,
      g: null,
      tip: d3Tip()
        .attr('class', 'd3-tip')
    }
  },
  computed: {
    ...mapGetters(['theme', 'variable']),
    path () {
      const map = this.map
      function projectPoint (x, y) {
        const point = map.latLngToLayerPoint(new L.LatLng(y, x))
        this.stream.point(point.x, point.y)
      }
      const transform = d3.geoTransform({ point: projectPoint })
      return d3.geoPath().projection(transform).pointRadius(this.pointRadius)
    },
    map () {
      return this.$parent.map
    },
    zoomLevel () {
      return this.$parent.zoomLevel
    },
    pointRadius () {
      return this.zoomLevel - 2
    }
  },
  mounted () {
    console.log(`map-layer(${this.id}):mounted`)
    evt.$on('map:zoom', this.resize)
    evt.$on('map:render', this.renderFill)

    this.g = this.$parent.svg.select('g.leaflet-zoom-hide')
      .append('g')
    this.g.call(this.tip)

    if (this.layer) {
      this.loadLayer(this.layer)
    }

    this.setTipHtml()
  },
  beforeDestroy () {
    console.log(`map-layer(${this.id}):beforeDestroy`)
    evt.$off('map:zoom', this.resize)
    evt.$off('map:render', this.renderFill)
    this.tip.destroy()
    this.g.selectAll('path').remove()
    this.g.remove()
    this.data = null
  },
  watch: {
    variable () {
      console.log(`map-layer(${this.id}):watch variable`)
      this.setTipHtml()
    },
    layer () {
      console.log(`map-layer(${this.id}):watch layer`)
      if (!this.layer) return

      return this.loadLayer(this.layer)
    },
    selected () {
      console.log(`map-layer(${this.id}):watch selected`)
      this.renderSelected()
    }
  },
  methods: {
    setTipHtml () {
      this.tip.html(d => `
        <strong>${this.getLabel(d)}</strong><br>
        ${this.variable.label}: ${typeof this.getValue(d) === 'number' ? this.valueFormat(this.getValue(d)) : 'N/A'}
      `)
    },
    loadLayer (layer) {
      console.log(`map-layer(${this.id}):loadLayer`, layer)
      if (!layer) return

      this.g
        .selectAll('path')
        .remove()

      return axios.get(`${layer.url}`)
        .then(response => response.data)
        .then((data) => {
          // console.log(`map-layer(${this.id}):loadLayer`, layer, 'parsing')
          let geoJson = data
          if (layer.type === 'topojson') {
            geoJson = topojson.feature(data, data.objects[layer.object])
          }

          this.data = Object.freeze(geoJson)

          this.resize()
        })
    },
    resize () {
      console.log(`map-layer(${this.id}):resize`)
      if (this.setBounds) {
        const bounds = this.path.bounds(this.data)
        this.$parent.$emit('resize', bounds)
      }

      this.render()
    },
    render () {
      console.log(`map-layer(${this.id}):render`)
      if (!this.data) return

      const features = this.data.features || []

      const tip = this.tip
      const vm = this

      const paths = this.g
        .selectAll('path')
        .data(features, d => `${this.theme.id}-${d.id}`)

      paths.enter()
        .append('path')
        .style('cursor', 'pointer')
        .style('pointer-events', 'visible')
        .on('click', function (d) {
          !vm.$parent.disableClick && vm.$emit('click', d)
          this.parentNode.appendChild(this) // move to front
        })
        .on('mouseenter', function (d) {
          if (!vm.selected) {
            // move to front if nothing selected
            this.parentNode.appendChild(this)
          } else {
            // move to 2nd from front, behind selected
            const lastChild = this.parentNode.lastChild
            this.parentNode.insertBefore(this, lastChild)
          }

          d3.select(this)
            .style('stroke', 'white')
            .style('stroke-width', '1')

          tip.show(d, this)
        })
        .on('mouseout', function (d) {
          d3.select(this)
            .style('stroke', vm.isSelected(d) ? 'red' : null)
            .style('stroke-width', null)
          tip.hide(d, this)
        })
        .merge(paths)
        .attr('d', this.path)
        .style('fill', this.getFill)

      paths.exit().remove()
    },
    renderFill () {
      // console.log(`map-layer(${this.id}):renderFill`)
      this.g
        .selectAll('path')
        .style('fill', this.getFill)
    },
    renderSelected () {
      console.log(`map-layer(${this.id}):renderSelected`)
      this.g
        .selectAll('path')
        .style('stroke', d => this.isSelected(d) ? 'red' : null)
    },
    isSelected (feature) {
      return !!this.selected && this.selected.id === feature.id
    }
  },
  render: function (h) {
    return null
  }
}
</script>

<style>
path {
  fill: rgb(200,200,200);
  stroke: rgb(0, 0, 0);
  stroke-width: 0.5px;
}
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
