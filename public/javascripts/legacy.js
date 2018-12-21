$(document).ready(function() {
  let map = L.map('map').setView([35.3973359,139.4651749], 17);
  let vertices = L.layerGroup().addTo(map);
  let edges = L.layerGroup().addTo(map);

  

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 19
    }
  ).addTo( map );

  let mapBounds = map.getBounds();
  //console.log(mapBounds);
  drawLinks(map, vertices, edges, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001);
  $('#zoomValue').html('current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');

  map.on('moveend', function() {
    mapBounds = map.getBounds();
    //console.log(mapBounds);
    if (map.getZoom() >= 17) {
      drawLinks(map, vertices, edges, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001);
    }
    $('#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');
  });
});

function drawLinks(map, vertices, edges, latStart, lngStart, latEnd, lngEnd) {
  let requestEdges = '/json/legacy/edge/?';
  requestEdges += 'latstart=' + latStart;
  requestEdges += '&lngstart=' + lngStart;
  requestEdges += '&latend=' + latEnd;
  requestEdges += '&lngend=' + lngEnd;

  $.getJSON(requestEdges).done(function(data) {
    //console.log(data);
    edges.clearLayers();
    vertices.clearLayers();

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
        weight: 5,
        opacity: 0.3,
        color: '#00FF00'
      })
      .bindPopup(popup, {autoClose: false, closeOnClick: false})
      .on('popupopen', function() {
        edge.setStyle({color: '#FF0000'});
      })
      .on('popupclose', function() {
        edge.setStyle({color: '#00FF00'});
      })

      //map.addLayer(edge);
      edges.addLayer(edge);

      let markerColor1;
      if (record.NODE1) {
        markerColor1 = '#FF0000';
      } else {
        markerColor1 = '#3366ff';
      }
      let vertex1 = L.circleMarker([record.LATITUDE1, record.LONGITUDE1], {
        radius: 5,
        stroke: false,
        fill: true,
        fillColor: markerColor1,
        fillOpacity: 0.5
      });

      let markerColor2;
      if (record.NODE2) {
        markerColor2 = '#FF0000';
      } else {
        markerColor2 = '#3366ff';
      }
      let vertex2 = L.circleMarker([record.LATITUDE2, record.LONGITUDE2], {
        radius: 5,
        stroke: false,
        fill: true,
        fillColor: markerColor2,
        fillOpacity: 0.5
      });

      vertices.addLayer(vertex1);
      vertices.addLayer(vertex2);
    });
  })
}