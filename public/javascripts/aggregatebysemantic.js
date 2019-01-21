
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
        console.log(data[0]);
        drawHistogram(data, 'count', [0, 500], 20);
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

// draw Histogram function
// data: CHORALE Query Result.
// xAxisColumn: Single column name of CHORALE Query
// xAxisRange: 2 element of Array, like [xMin, xMax]. ex.) [0, 500].
// binsNum: Number of bins.
function drawHistogram(data, xAxisColumn, xAxisRange, binsNum) {
  // set drawing area.
  d3.selectAll('svg')
      .remove();
  
  let svg = d3.select('#graph').append("svg")
              .attr("width", $("#graph").width())
              .attr("height", $("#graph").height());
  let margin = {top: 10, right: 30, bottom: 10, left: 30},
      width = svg.attr("width"),
      height = svg.attr("height");

  let xScale = d3.scaleLinear()
                .domain(xAxisRange)
                .rangeRound([0, width - margin.right - margin.left]);
  
  let yScale = d3.scaleLinear()
                .range([height - margin.top - margin.bottom, 0])
  
  let histogram = d3.histogram()
                    .value((d) => { return d[xAxisColumn]; })
                    .domain(xScale.domain())
                    .thresholds(xScale.ticks(binsNum));

  let bins = histogram(data);
  yScale.domain([0, d3.max(bins, (d) => { 
    if (d.length) {
      return d.length;
    } else {
      return 0;
    }
  })]);

  console.log(bins);

  svg.selectAll('rect')
        .data(bins)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', 1)
        .attr('transform', (d) => {
          if (d.length) {
            return 'translate(' + (xScale(d.x0) + margin.left) + ',' + yScale(d.length) + ')';
          } else {
            console.log('d.length is undefined.');
            return 'translate(' + (xScale(d.x0) + margin.left) + ', 0)';
          }
          
        })
        .attr('width', (d) => { return xScale(d.x1) - xScale(d.x0) - 1; })
        .attr('height', (d) => {
          if (d.length) {
            return height - margin.top - margin.bottom - yScale(d.length);  
          } else {
            return 0;
          }
        });

  // add the x Axis
  svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + (height - margin.top - margin.bottom) + ')')
        .call(d3.axisBottom(xScale));

  // add the y Axis
  svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .call(d3.axisLeft(yScale));
}

