let highlighted = []

let linkSearcher
class LinkSearcher {
  constructor(map, lines, vertices) {
    this.map = map
    this.vertices = vertices
    this.lines = lines
    this.markers = []
    this.linkIDs = []
  }

  clicked(e) {
    const linkID = e.target.attribution
    const index = this.linkIDs.indexOf(linkID)
    if(index === -1) {
      this.add(e)
      if(this.markers.length > 1) {
        const markerLength = this.markers.length
        this.search(markerLength - 2, markerLength - 1)
      }
    } else {
      this.delete(e)
      highlighted = []
      $('#layersInfo').val("")
      for(let i = 0; i < this.markers.length - 1; i++) {
        this.search(i, i+1)
      }
    }
  }

  get edgeLatLng() {
    const edge = {
      latStart: 999, latEnd: -999,
      lngStart: 999, lngEnd: -999,
    }
    for(let i in this.markers) {
      const latlng = this.markers[i]._latlng
      if(edge.latStart > latlng.lat) edge.latStart = latlng.lat - 0.1
      if(edge.latEnd   < latlng.lat) edge.latEnd   = latlng.lat + 0.1
      if(edge.lngStart > latlng.lng) edge.lngStart = latlng.lng - 0.1
      if(edge.lngEnd   < latlng.lng) edge.lngEnd   = latlng.lng + 0.1
    }
    return edge
  }

  add(e) {
    const linkID = e.target.attribution
    const marker = L.marker(e.latlng, {alt: linkID})
    this.markers.push(marker)
    this.linkIDs.push(linkID)
    marker.addTo(this.map)
      .bindPopup(`${this.markers.length}`)
      .openPopup()
  }

  delete(e) {
    const linkID = e.target.attribution
    const index = this.linkIDs.indexOf(linkID)
    this.map.removeLayer(this.markers[index])
    this.markers.splice(index, 1)
    this.linkIDs.splice(index, 1)
  }

  norm(latlng1, latlng2) {
    return Math.sqrt(Math.pow(latlng1.lat - latlng2.lat, 2) + Math.pow(latlng1.lng - latlng2.lng, 2))
  }

  search(startIdx, endIdx) {
    const edge = this.edgeLatLng
    const fetchURL = `/json/gsi20/links/edge/?latstart=${edge.latStart}&lngstart=${edge.lngStart}&latend=${edge.latEnd}&lngend=${edge.lngEnd}`

    fetch(fetchURL).then((response) => {
      return response.json()
    }).then((json) => {
      const searchedLinksNum = []
      const queue = []
      const completedLinks = []
      const first = json.filter((v, i, a) => {
        return v.LINK_ID1 === this.markers[startIdx].options.alt
      })[0]
      queue.push({
        link: first,
        parent: [first.LINK_ID1],
        distance: 0.0
      })
      while(true) {
        const now = queue.shift()
        // search finished
        if(now === undefined) {
          // no links found
          if(completedLinks.length === 0) {
            $('#layersInfo').val("error")
            break
          }
          // found links
          let minDistance = Infinity
          let minLink = null
          for(let i in completedLinks) {
            if(completedLinks[i].distance < minDistance) {
              minDistance = completedLinks[i].distance
              minLink = completedLinks[i]
            }
          }
          const parents = minLink.parent.concat()
          highlighted = highlighted.concat(parents)
          highlighted.push(minLink.link.LINK_ID1)
          $('#layersInfo').val(highlighted.join(",\n"))
          break
        }
        // found a complete link
        if(now.link.LINK_ID1 === this.markers[endIdx].options.alt) {
          completedLinks.push(now)
          continue
        }
        searchedLinksNum.push(now.link.NUM1)
        const nextLinks = json.filter((v, i, a) => {
          return ((v.LATITUDE1 === now.link.LATITUDE1) && (v.LONGITUDE1 === now.link.LONGITUDE1)) ||
                 ((v.LATITUDE1 === now.link.LATITUDE2) && (v.LONGITUDE1 === now.link.LONGITUDE2)) ||
                 ((v.LATITUDE2 === now.link.LATITUDE2) && (v.LONGITUDE2 === now.link.LONGITUDE2)) ||
                 ((v.LATITUDE2 === now.link.LATITUDE1) && (v.LONGITUDE2 === now.link.LONGITUDE1))
        })
        for(let i in nextLinks) {
          if(searchedLinksNum.indexOf(nextLinks[i].NUM1) === -1) {
            const parent = now.parent.slice()
            if(parent.indexOf(now.link.LINK_ID1) === -1) {
              parent.push(now.link.LINK_ID1)
            }
            queue.push({
              link: nextLinks[i],
              parent: parent,
              distance: now.distance + this.norm({
                lat: nextLinks[i].LATITUDE1, lng: nextLinks[i].LONGITUDE1
              }, {
                lat: nextLinks[i].LATITUDE2, lng: nextLinks[i].LONGITUDE2
              })
            })
            searchedLinksNum.push(nextLinks[i].NUM1)
          }
        }
      }
    })
  }
}

$(document).ready(() => {
  const map = L.map('map').setView([43.46326112204825, 143.75189781188968], 17)
  const vertices = L.layerGroup().addTo(map)
  const lines = L.layerGroup().addTo(map)
  const zoomThreshold = 14
  linkSearcher = new LinkSearcher(map, lines, vertices)

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
    drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001)
  })

  $('#btnReverse').on('click', (e) => {
    highlighted = highlighted.reverse()
    $('#layersInfo').val(highlighted.join(",\n"))
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
        .on('contextmenu', (e) => {
          linkSearcher.clicked(e)
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
