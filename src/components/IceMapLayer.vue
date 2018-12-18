<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import * as topojson from 'topojson-client'

import evt from '@/event-bus'
import variableMixin from '@/mixins/variable'

export default {
  name: 'IceMapLayer',
  props: ['setBounds', 'layer', 'getFill', 'getValue', 'getLabel', 'selected'],
  mixins: [variableMixin],
  mounted () {
    evt.$on('map:zoom', this.resize)
    evt.$on('map:render', this.renderFill)

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
        <strong>${this.getLabel(d)}</strong><br>
        ${this.variable.label}: ${this.getValue(d) ? this.valueFormat(this.getValue(d)) : 'N/A'}
      `)
    },
    layer () {
      // console.log('layer:watch layer', this.layer)
      if (!this.layer) return

      return this.loadLayer(this.layer)
    },
    selected () {
      this.renderSelected()
    }
  },
  methods: {
    loadLayer (layer) {
      // console.log('layer:loadLayer', layer)
      if (!layer) return
      // console.log('layer:loadLayer', layer, 'fetching')

      this.svg
        .select('g')
        .selectAll('path')
        .remove()

      return axios.get(`${layer.url}`)
        .then(response => response.data)
        .then((data) => {
          // console.log('layer:loadLayer', layer, 'parsing')
          let geoJson = data
          if (layer.type === 'topojson') {
            geoJson = topojson.feature(data, data.objects[layer.object])
          }

          this.layerData = geoJson

          this.resize()
        })
    },
    resize () {
      // console.log('layer:resize')
      if (this.setBounds) {
        const bounds = this.path.bounds(this.layerData)
        this.$parent.$emit('resize', bounds)
      }

      this.render()
    },
    render () {
      // console.log('layer:render')
      if (!this.features || this.features.length === 0) return

      const tip = this.tip
      const vm = this

      const paths = this.svg
        .select('g')
        .selectAll('path')
        .data(this.features, d => `${this.theme.id}-${d.id}`)

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
      // console.log('layer:renderFill')
      this.svg
        .select('g')
        .selectAll('path')
        .style('fill', this.getFill)
    },
    renderSelected () {
      this.svg
        .select('g')
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
