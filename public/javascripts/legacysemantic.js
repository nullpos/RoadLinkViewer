var highlighted = [];
var semanticsArray = [];

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
  createSemanticPulldown();

  let mapBounds = map.getBounds();
  //console.log(mapBounds);
  drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001, 0);
  $('#zoomValue').html('current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');

  map.on('moveend', function() {
    mapBounds = map.getBounds();
    if (map.getZoom() >= 17) {
      let semanticid = $('#semanticPulldown').val();
      drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001, semanticid);
    }
    $('#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');
  });

  $('#semanticPulldown').on('change', () => {
    let semanticid = $('#semanticPulldown').val();
    mapBounds = map.getBounds();
    if (map.getZoom() >= 17) {
      drawLinks(vertices, lines, mapBounds.getSouth() - 0.001, mapBounds.getWest() - 0.001, mapBounds.getNorth() + 0.001, mapBounds.getEast() + 0.001, semanticid);
    }
    $('#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 17, markers will not be ploted.');

    if (semanticid == '-1') {
      // display new semantic form.
      $('#rightcolumn').append('<div id="newSemanticForms"></div>');
      $('#newSemanticForms').append('Semantic id <input id="newSemanticId" type="text">');
      $('#newSemanticForms').append('Semantic name <input id="newSemanticName" type="text">');
      $('#newSemanticForms').append('Semantic driver <input id="newSemanticDriverId" type="text">');
    }
  })
});

function createSemanticPulldown() {
  let requestURL = '/json/legacy/semanticlist/';
  $.getJSON(requestURL).done(function(data) {
    semanticsArray = data;
    console.log(semanticsArray);
    let semanticPulldown = $('#semanticPulldown');
    semanticPulldown.empty();
    semanticPulldown.append('<option value="0" selected>---</option>');

    data.forEach((record) => {
      let id = record.SEMANTIC_LINK_ID;
      let semantics = record.SEMANTICS;
      semanticPulldown.append('<option value="' + id + '">' + id + ': ' + semantics + '</option>');
    });

    semanticPulldown.append('<option value="-1">Create new Semantics</option>');
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
      let linkid = feature.properties.linkid;
      let semanticid = $('#semanticPulldown').val();
      let selectedItem = semanticsArray.filter(semantic => semantic.SEMANTIC_LINK_ID == semanticid)[0];
      let popupContent = '<div class=\"popupText\">';
      popupContent += linkid;
      popupContent += '</div>';
      let popup = L.popup()
                    .setContent(popupContent);

      let line = L.polyline(feature.geometry.coordinates, {
        weight: 10,
        opacity: 0.5
      })
        .bindPopup(popup, {})
        .on('click', () => {
          if (line.attribution.issemantic == 1) {
            console.log('remove ' + linkid + ' from ' + semanticid);
            requestLinkDelete(semanticid, linkid);
            line.attribution.color = '#0000FF';
          } else if (semanticid == -1) {
            // new Semantics
            // validate form value
            let newSemanticId = parseInt($('#newSemanticId').val());
            let newSemanticName = $('#newSemanticName').val();
            let newSemanticDriverId = parseInt($('#newSemanticDriverId').val());
            if (!Number.isInteger(newSemanticId)) {
              console.log(':'+newSemanticId+':');
              alert('Semantic id Must be Interger!');
              return;
            }
            if (!Number.isInteger(newSemanticDriverId)) {
              console.log(':'+newSemanticDriverId+':');
              alert('Semantic Driver id must be interger!');
              return;
            }
            if (newSemanticName.length == 0) {
              console.log(newSemanticName + ': ' + newSemanticName.length);
              alert('Name must not be null!');
              return;
            }

            // value was validated.
            requestLinkCreate(newSemanticId, newSemanticName, newSemanticDriverId, linkid);
            line.attribution.color = '#FF0000';
          } else if (semanticid != 0) {
            requestLinkCreate(semanticid, selectedItem.SEMANTICS, selectedItem.DRIVER_ID, linkid);
            line.attribution.color = '#FF0000';
          }
        })
        .on('popupopen', () => {
          line.setStyle({color: '#00FF00'});
        })
        .on('popupclose', () => {
          line.setStyle({color: line.attribution.color});
        });
      line.attribution = {};
      line.attribution.linkid = linkid;
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

  $.post(
    requestURL,
    {
      semanticid: semanticid,
      linkid: linkid,
      semantic: semantic,
      driverid: driverid
    }
  ).done((response) => {
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