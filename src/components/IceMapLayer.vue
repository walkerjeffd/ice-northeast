<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

import evt from '@/event-bus'

export default {
  name: 'IceMapLayer',
  props: ['setBounds', 'layer', 'colorScale'],
  mounted () {
    evt.$on('map:zoom', this.resize)
    evt.$on('map:render', this.render)
  },
  data () {
    return {
      layerData: null
    }
  },
  computed: {
    ...mapGetters(['theme']),
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

      const paths = this.svg
        .select('g')
        .selectAll('path')
        .data(this.features, d => d.id)

      paths.enter()
        .append('path')
        .style('cursor', 'pointer')
        .style('pointer-events', 'visible')
        .on('click', (d) => (!this.$parent.disableClick && this.$emit('click', d)))
        .merge(paths)
        .attr('d', this.path)
        .style('fill', this.colorScale)

      paths.exit().remove()
    }
  },
  render: function (h) {
    return null
  }
}
</script>
