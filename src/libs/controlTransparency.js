import * as d3 from 'd3'
import 'jquery-ui/themes/base/core.css'
import 'jquery-ui/themes/base/theme.css'
import 'jquery-ui/themes/base/slider.css'
import 'jquery-ui/ui/core'
import 'jquery-ui/ui/widgets/slider'

L.Control.Transparency = L.Control.extend({
  onAdd: (map) => {
    var container = L.DomUtil.create('div', 'ice-control-transparency leaflet-bar')

    var slider = L.DomUtil.create('div', 'ice-control-transparency-slider', container)
    slider.style.height = '100px'

    $(slider).slider({
      orientation: 'vertical',
      range: 'max',
      value: 100,
      min: 0,
      max: 100,
      start: (event, ui) => {
        map.dragging.disable()
      },
      slide: (event, ui) => {
        var opacity = (+ui.value) / 100

        d3.select(map.getPanes().overlayPane)
          .select('svg')
          .attr('opacity', opacity)
      },
      stop: function (event, ui) {
        map.dragging.enable()
      }
    })

    return container
  }
})

L.control.transparency = function (opts) {
  return new L.Control.Transparency(opts)
}
