var highlighted = [];

$(document).ready(function() {
  let map = L.map('map').setView([43.46326112204825, 143.75189781188968], 17);
  let vertices = L.layerGroup().addTo(map);
  let lines = L.layerGroup().addTo(map);

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 19
    }
  ).addTo( map );

  let mapBounds = map.getBounds();
  let mapCenter = map.getCenter();
  //console.log(mapBounds);
  drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001);
  $('#zoomValue').html('current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');
  $('#centerPoint').html('Center: ' + mapCenter.lat + ', ' + mapCenter.lng);

  map.on('moveend', function() {
    mapBounds = map.getBounds();
    mapCenter = map.getCenter();
    //console.log(mapBounds);
    if (map.getZoom() >= 14) {
      drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001);
    }
    $('#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');
    $('#centerPoint').html('Center: ' + mapCenter.lat + ', ' + mapCenter.lng);
  });
});

function drawLinks(vertices, lines, latStart, lngStart, latEnd, lngEnd) {
  let requestLineString = '/json/2019/linestring/?';
  requestLineString += 'latstart=' + latStart;
  requestLineString += '&lngstart=' + lngStart;
  requestLineString += '&latend=' + latEnd;
  requestLineString += '&lngend=' + lngEnd;

  $.getJSON(requestLineString).done(function(data) {
    //console.log(data);
    //lines.clearLayers();
    lines.eachLayer(function(line) {
      if (highlighted.indexOf(line.attribution) == -1) {
        lines.removeLayer(line);
      }
    })
    vertices.clearLayers();

    data.features.forEach(function(feature) {
      if (highlighted.indexOf(feature.properties.linkid) >= 0) {
        // This link is already displayed.
        return;
      }

      let popupContent = '<div class=\"popupText\">';
      popupContent += feature.properties.linkid;
      popupContent += '</div>';
      let popup = L.popup()
                    .setContent(popupContent);

      let line = L.polyline(feature.geometry.coordinates, {
        weight: 10,
        opacity: 0.3,
        color: '#0000FF'
      })
        .on('click', function() {
          //line.setStyle({color: '#FF0000'});
          if (highlighted.indexOf(line.attribution) >= 0) {
            // This line is already highlighted.
            // Color turns to default.
            line.setStyle({color: '#0000FF'});
            // Remove linkid from highlighted.
            highlighted = highlighted.filter(v => v != line.attribution);
          } else {
            // This line is not highlighted now.
            // Color turns to special.
            line.setStyle({color: '#FF0000'});
            // Add this line into highlighted.
            highlighted.push(line.attribution);
          }
          let text = '';
          highlighted.forEach(function(linkid, index) {
            text += linkid;
            if (index != highlighted.length - 1) {
              text += ',';
            }
            text += '<br>';
          });
          $('#layersInfo').html(text);
        });
      line.attribution = feature.properties.linkid;

      lines.addLayer(line);

      let len = feature.properties.count;

      let compositionColor = '#0000FF';
      let nodeColor = '#FF0000';

      feature.geometry.coordinates.forEach(function(coordinate, index) {
        let vertex = L.circleMarker(coordinate , {
          radius: 5,
          stroke: false,
          fill: true,
          fillOpacity: 0.5
        });

        if (index == 0 || index == len - 1) {
          vertex.setStyle({fillColor: nodeColor});
        } else {
          vertex.setStyle({fillColor: compositionColor});
        }
        vertices.addLayer(vertex);
      });
    });
  })
}