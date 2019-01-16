
$(document).ready(function() {
  let map = L.map('map').setView([35.3973359, 139.4651749], 17);
  let lines = L.layerGroup().addTo(map);

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 19
    }
  ).addTo( map );

  createSemanticPulldown();

  // event handlers.
  $('#semanticPulldown').on('change', () => {
    let semanticid = $('#semanticPulldown').val();
    console.log(semanticid);

    if (semanticid != -1) {
      drawSemantic(lines, semanticid);
    }
  })
});

function createSemanticPulldown() {
  let requestURL = '/json/legacy/semanticlist/';

  $.getJSON(requestURL).done(function(data) {
    semanticsArray = data;
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

function drawSemantic(lines, semanticid) {
  // No semantic specified, not need request.
  if (!semanticid) {
    return;
  }

  console.log('will draw semantic');

  let requestURL = '/json/legacy/semantics/?semanticid=' + semanticid;

  $.getJSON(requestURL).done(function(data) {
    console.log(data);
    lines.clearLayers();

    data.features.forEach(function(feature) {
      
      let line = L.polyline(feature.geometry.coordinates, {
        weight: 10,
        opacity: 0.5,
        color: '#FF0000'
      });

      lines.addLayer(line);
    })
  })

}

