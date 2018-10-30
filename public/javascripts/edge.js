$(document).ready(function() {
  let map = L.map('map').setView([43.188627611, 141.008331], 15);
  let vertices = new Array();
  let edges = new Array();
  

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 20
    }
  ).addTo( map );

  let mapBounds = map.getBounds();
  //console.log(mapBounds);
  drawLinks(map, vertices, edges, mapBounds.getSouth(), mapBounds.getWest(), mapBounds.getNorth(), mapBounds.getEast());
  $('span#zoomValue').html('current map zoom level is ' + map.getZoom() + '. If map zoom level below 15, markers will not be ploted.');

  map.on('moveend', function() {
    mapBounds = map.getBounds();
    //console.log(mapBounds);
    if (map.getZoom() >= 15) {
      drawLinks(map, vertices, edges, mapBounds.getSouth(), mapBounds.getWest(), mapBounds.getNorth(), mapBounds.getEast());
    }
    $('span#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 15, markers will not be ploted.');
  });
});

function drawLinks(map, vertices, edges, latStart, lngStart, latEnd, lngEnd) {
  let requestEdges = '/json/links/edge/?';
  requestEdges += 'latstart=' + latStart;
  requestEdges += '&lngstart=' + lngStart;
  requestEdges += '&latend=' + latEnd;
  requestEdges += '&lngend=' + lngEnd;

  $.getJSON(requestEdges).done(function(data) {
    console.log(data);
    edges.forEach(function(edge) {
      map.removeLayer(edge);
    });
    edges = new Array();

    data.forEach(function(record) {
      let popupContent = '<div class=\"popupText\">';
      for (key in record) {
        popupContent += '' + key + ': ' + record[key] + '<br>';
      }
      popupContent += '</div>';
      let popup = L.popup()
                    .setContent(popupContent);

      let edge = L.polyline([[record.LATITUDE1, record.LONGITUDE1], 
                                  [record.LATITUDE2, record.LONGITUDE2]], {
        weight: 3,
        opacity: 0.3,
        color: '#00FF00'
      })
      .bindPopup(popup);

      map.addLayer(edge);
      edges.push(edge);
    });
  })

  let requestVertices = '/json/links/vertex/?';
  requestVertices += 'latstart=' + latStart;
  requestVertices += '&lngstart=' + lngStart;
  requestVertices += '&latend=' + latEnd;
  requestVertices += '&lngend=' + lngEnd;

  $.getJSON(requestVertices, function(data) {
    
    vertices.forEach(function(vertex) {
      map.removeLayer(vertex);
    });
    data.forEach(function(record) {
      let popupContent = '<div class=\"popupText\">';
      for (key in record) {
        popupContent += '' + key + ': ' + record[key] + '<br>';
      }
      popupContent += '</div>';

      let popup = L.popup()
                    .setContent(popupContent);
      let markerColor;
      if (record.NODE) {
        markerColor = '#FF0000';
      } else {
        markerColor = '#3366ff';
      }

      let vertex = L.circleMarker([record.LATITUDE, record.LONGITUDE], {
        radius: 5,
        stroke: false,
        fill: true,
        fillColor: markerColor,
        fillOpacity: 0.8
      })
      .bindPopup(popup);

      map.addLayer(vertex);
      vertices.push(vertex);
    });
  })
}