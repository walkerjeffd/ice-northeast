<template>
  <div class="ice-map">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import * as d3 from 'd3'
import 'leaflet/dist/leaflet.css'

import evt from '@/event-bus'

require('leaflet-bing-layer')

export default {
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      ready: false,
      map: null,
      disableClick: false,
      bounds: null
    }
  },
  mounted () {
    this.map = L.map(this.$el, {
      ...this.options
    })

    L.control.scale({ position: 'bottomleft' }).addTo(this.map)

    const basemaps = {
      'Bing Satellite': L.tileLayer.bing('AvSDmEuhbTKvL0ui4AlHwQNBVuDI2QBBoeODy1vwOz5sW_kDnBx3UMtUxbjsZ3bN').addTo(this.map),
      'Open Street Map': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }),
      'No Basemap': L.tileLayer('')
    }

    L.control.layers(basemaps, {}, {
      position: 'topleft',
      collapsed: true
    }).addTo(this.map)

    const svg = d3.select(this.map.getPanes().overlayPane).append('svg')
    svg.append('g').attr('class', 'leaflet-zoom-hide')

    let moveTimeout
    this.map.on('movestart', () => {
      window.clearTimeout(moveTimeout)
      this.disableClick = true
    })
    this.map.on('moveend', () => {
      moveTimeout = setTimeout(() => {
        this.disableClick = false
      }, 100)
    })
    this.map.on('zoomend', () => {
      evt.$emit('map:zoom')
    })

    this.$on('resize', this.resize)
    evt.$on('map:zoomTo', this.zoomTo)

    this.ready = true
  },
  beforeDestroy () {
    evt.$on('map:zoomTo', this.zoomTo)
  },
  computed: {
    svg () {
      return d3.select(this.map.getPanes().overlayPane).select('svg')
    }
  },
  methods: {
    resize (bounds) {
      if (bounds) this.bounds = bounds

      const topLeft = this.bounds[0]
      const bottomRight = this.bounds[1]

      this.svg.attr('width', bottomRight[0] - topLeft[0])
        .attr('height', bottomRight[1] - topLeft[1])
        .style('left', `${topLeft[0]}px`)
        .style('top', `${topLeft[1]}px`)

      this.svg.select('g')
        .attr('transform', `translate(${-topLeft[0]},${-topLeft[1]})`)
    },
    zoomTo (feature) {
      if (!feature) return

      this.map.fitBounds(L.geoJson(feature).getBounds())
    }
  }
}
</script>

<style>
.ice-map {
  width: 100%;
  height: 100vh;
}

div.leaflet-top.leaflet-left {
  margin-left: 450px;
  margin-top: 60px;
}

.leaflet-touch .leaflet-control-layers-toggle {
  width: 30px !important;
  height: 30px !important;
}
</style>
