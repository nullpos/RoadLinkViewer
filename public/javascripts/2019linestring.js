let highlighted = []

$(document).ready(function() {
  const map = L.map('map').setView([43.46326112204825, 143.75189781188968], 17)
  const vertices = L.layerGroup().addTo(map)
  const lines = L.layerGroup().addTo(map)
  const zoomThreshold = 14

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 19
    }
  ).addTo( map )
  
  const mapBounds = map.getBounds()
  const mapCenter = map.getCenter()
  drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001)
  $('#zoomValue').html(`current map zoom level is ${map.getZoom()}. If map zoom level below ${zoomThreshold}, markers will not be ploted.`)
  $('#centerPoint').html(`Center: ${mapCenter.lat}, ${mapCenter.lng}`)

  map.on('moveend', () => {
    const mapBounds = map.getBounds()
    const mapCenter = map.getCenter()
    if (map.getZoom() >= zoomThreshold) {
      drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001)
    }
    $('#zoomValue').html(`current map zoom level is ${map.getZoom()}. If map zoom level below ${zoomThreshold}, markers will not be ploted.`)
    $('#centerPoint').html(`Center: ${mapCenter.lat}, ${mapCenter.lng}`)
  })

  $('#layersInfo').on('change', (e) => {
    highlighted = e.target.value.replace(/\r?\n/g, '').split(',')
  })
})

function drawLinks(vertices, lines, latStart, lngStart, latEnd, lngEnd) {
  const requestLineString = `/json/2019/linestring/?latstart=${latStart}&lngstart=${lngStart}&latend=${latEnd}&lngend=${lngEnd}`

  $.getJSON(requestLineString).done(function(data) {
    lines.clearLayers()
    vertices.clearLayers()

    data.features.forEach(function(feature) {
      // add lines
      const normalColor = '#0000FF'
      const highlightColor = '#FF0000'
      const color = (highlighted.indexOf(feature.properties.linkid) === -1) ? normalColor: highlightColor
      const line = L.polyline(feature.geometry.coordinates, {
        weight: 10,
        opacity: 0.3,
        color: color
      })
        .on('click', () => {
          if (highlighted.indexOf(line.attribution) !== -1) {
            // This line is already highlighted.
            // Color turns to default.
            line.setStyle({color: '#0000FF'})
            // Remove linkid from highlighted.
            highlighted.splice(highlighted.indexOf(line.attribution), 1)
          } else {
            // This line is not highlighted now.
            // Color turns to special.
            line.setStyle({color: '#FF0000'})
            // Add this line into highlighted.
            highlighted.push(line.attribution)
          }
          $('#layersInfo').val(highlighted.join(",\n"))
        })
      line.attribution = feature.properties.linkid
      lines.addLayer(line)

      // add vertices
      const len = feature.properties.count
      const compositionColor = '#0000FF'
      const nodeColor = '#FF0000'
      feature.geometry.coordinates.forEach((coordinate, index) => {
        const vertex = L.circleMarker(coordinate , {
          radius: 5,
          stroke: false,
          fill: true,
          fillOpacity: 0.5
        })

        const color = (index === 0 || index === len - 1) ? nodeColor: compositionColor
        vertex.setStyle({fillColor: color})
        vertices.addLayer(vertex)
      })
    })
  })
}
