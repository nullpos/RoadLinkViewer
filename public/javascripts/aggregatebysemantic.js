
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

  $('#drawButton').on('click', () => {
    let semanticid = $('#semanticPulldown').val();
    let direction = $('#directionPulldown').val();

    if (semanticid != -1) {
      drawSemantic(lines, semanticid);

      let requestURL = '/json/legacy/chorale?semanticid=' + semanticid + '&direction=' + direction;
      $.getJSON(requestURL).done((data) => {
        
      })
    }
  })

  $('#submitButton').on('click', () => {
    let query = $('#sqlbox').val();
    query = query.replace(/\n/g, ' ');
    console.log(query);

    let requestURL = '/query?query=' + query;
    alert('Sorry, custom sql feature have not been implemented.');

    return;
    $.getJSON(requestURL).done((data) => {
      console.log(data);
    })
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

// d3.js functions

function drawHistogram(data, xAxisColumn, yAxisColumn, xAxisRange, yAxixRange, bins) {
  // set drawing area.
  
  let svg = d3.select('#graph').append("svg")
              .attr("width", $("#graph").width())
              .attr("height", $("#graph").height());
  let margin = {top: 10, right: 30, bottom: 10, left: 30},
      width = svg.attr("width"),
      height = svg.attr("height");
  
}

