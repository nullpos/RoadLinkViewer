var highlighted = [];

$(document).ready(function() {
  let map = L.map('map').setView([35.3973359,139.4651749], 17);
  let vertices = L.layerGroup().addTo(map);
  let lines = L.layerGroup().addTo(map);

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 19
    }
  ).addTo( map );

  console.log('?');
  createSemanticPulldown();

  let mapBounds = map.getBounds();
  //console.log(mapBounds);
  drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001, 0);
  $('#zoomValue').html('current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');

  map.on('moveend', function() {
    mapBounds = map.getBounds();
    //console.log(mapBounds);
    if (map.getZoom() >= 17) {
      let semanticid = $('#semanticPulldown').val();
      console.log(semanticid);
      drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001, semanticid);
    }
    $('#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');
  });

  $('#semanticPullDown').on('change', () => {
    mapBounds = map.getBounds();
    //console.log(mapBounds);
    if (map.getZoom() >= 17) {
      let semanticid = $('#semanticPulldown').val();
      console.log(semanticid);
      drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001, semanticid);
    }
    $('#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');
  })
});

function createSemanticPulldown() {
  let requestURL = '/json/legacy/semanticlist/';
  $.getJSON(requestURL).done(function(data) {
    let semanticPulldown = $('#semanticPulldown');
    semanticPulldown.empty();
    semanticPulldown.append('<option value="0" selected>---</option>');

    data.forEach((record) => {
      let id = record.SEMANTIC_LINK_ID;
      let semantics = record.SEMANTICS;
      semanticPulldown.append('<option value="' + id + '">' + id + ': ' + semantics + '</option>');
    });
  })
}

function drawLinks(vertices, lines, latStart, lngStart, latEnd, lngEnd, semanticid) {
  let requestLineString = '/json/legacy/semantics/?';
  requestLineString += 'latstart=' + latStart;
  requestLineString += '&lngstart=' + lngStart;
  requestLineString += '&latend=' + latEnd;
  requestLineString += '&lngend=' + lngEnd;
  if (semanticid) {
    requestLineString += '&semanticid=' + semanticid;
  }

  $.getJSON(requestLineString).done(function(data) {
    //console.log(data);
    lines.clearLayers();
    vertices.clearLayers();

    data.features.forEach(function(feature) {
      let popupContent = '<div class=\"popupText\">';
      popupContent += feature.properties.linkid;
      popupContent += '</div>';
      let popup = L.popup()
                    .setContent(popupContent);

      let line = L.polyline(feature.geometry.coordinates, {
        weight: 10,
        opacity: 0.5
      })
        .bindPopup(popup, {})
        .on('click', function() {
          console.log(line.attribution);
        })
        .on('popupopen', () => {
          line.setStyle({color: '#00FF00'});
        })
        .on('popupclose', () => {
          line.setStyle({color: line.attribution.color});
        });
      line.attribution = {};
      line.attribution.linkid = feature.properties.linkid;
      line.attribution.issemantic = feature.properties.issemantics;
      line.attribution.count = feature.properties.count;

      // Default Color is blue.
      line.attribution.color = '#0000FF';
      
      if (line.attribution.issemantic == 1) {
        // if this link is contained in specified semantic link.
        line.attribution.color = '#FF0000';
      }

      line.setStyle({color: line.attribution.color});

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

function requestLinkCreate(semanticid, semantic, driverid, linkid) {
  if (!(semanticid && linkid && semantic && driverid)) {
    return false;
  }

  let requestURL = '/methods/createsemantic';
  requestURL += '?semanticid=' + semanticid;
  requestURL += '&linkid=' + linkid;
  requestURL += '&semantic=' + semantic;
  requestURL += '&driverid' + driverid;

  $.ajax({
    url: requestURL,
    type: 'POST',
  }).done((response) => {
    console.log(response);
  });
}

function requestLinkDelete(semanticid, linkid) {
  // From semanticid and link id, delete link from semantic link.
  if (!(semanticid && linkid)) {
    return false;
  }

  let requestURL = '/methods/deletesemantic';
  requestURL += '?semanticid=' + semanticid;
  requestURL += '&linkid=' + linkid;

  $.ajax({
    url: requestURL,
    type: 'DELETE'
  }).done((response) => {
    console.log(response);
  })
}