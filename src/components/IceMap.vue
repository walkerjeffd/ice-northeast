<template>
  <div class="ice-map">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import * as d3 from 'd3'
import '../libs/controlTransparency'
import 'leaflet/dist/leaflet.css'

import evt from '@/events'

export default {
  props: {
    options: {
      type: Object,
      required: true
    },
    overlays: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      ready: false,
      map: null,
      disableClick: false,
      bounds: null,
      zoomLevel: null
    }
  },
  mounted () {
    this.map = L.map(this.$el, {
      ...this.options,
      zoomControl: false
    })
    this.zoomLevel = this.map.getZoom()

    L.control.scale({ position: 'bottomright' }).addTo(this.map)
    L.control.zoom({ position: 'topright' }).addTo(this.map)

    const basemaps = {
      'ESRI World Imagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      'Open Street Map': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }),
      'No Basemap': L.tileLayer('').addTo(this.map)
    }

    const overlays = {}
    this.overlays.forEach((d) => {
      const key = `<img src="${d.url}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=${d.layer}&LEGEND_OPTIONS=fontAntiAliasing:true;forceLabels:off"> ${d.label}`

      const layer = L.tileLayer.wms(d.url, {
        layers: d.layer,
        format: 'image/png',
        transparent: true,
        opacity: d.opacity || 0.5,
        minZoom: d.minZoom || -Infinity,
        maxZoom: d.maxZoom || Infinity
      })

      overlays[key] = layer

      if (d.visible) layer.addTo(this.map)
    })

    L.control.transparency({ position: 'topright' }).addTo(this.map)

    L.control.layers(basemaps, overlays, {
      position: 'topright',
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
      this.zoomLevel = this.map.getZoom()
      evt.$emit('map:zoom')
    })

    this.$on('resize', this.resize)
    evt.$on('map:zoomTo', this.zoomTo)

    this.ready = true
  },
  beforeDestroy () {
    evt.$off('map:zoomTo', this.zoomTo)
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
  height: 100%;
  /* height: 100vh; */
}

div.leaflet-top.leaflet-left {
  /* margin-left: 450px; */
  /* margin-top: 0; */
}

.leaflet-touch .leaflet-control-layers-toggle {
  width: 30px !important;
  height: 30px !important;
}

.ice-control-transparency {
  width: 34px;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 5px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.4);
}

.ice-control-transparency-slider {
  height: 100px;
  display: inline-block;
}

.leaflet-bar a, .leaflet-bar a:hover {
  width: 34px;
  height: 34px;
  padding-top: 4px;
}
</style>
