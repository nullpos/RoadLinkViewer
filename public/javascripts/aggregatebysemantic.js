
$(document).ready(function() {
  let map = L.map('map').setView([35.47235785,	139.58691997], 13);
  let lines = L.layerGroup().addTo(map);
  let choraleData = [];

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 19
    }
  ).addTo( map );

  createSemanticPulldown();
  createConfig(choraleData);

  // event handlers.
  $('#semanticPulldown').on('change', () => {
    let semanticid = $('#semanticPulldown').val();

    if (semanticid != -1) {
      drawSemantic(map, lines, semanticid);
    }
  })

  $('#fetchButton').on('click', () => {
    let semanticid = $('#semanticPulldown').val();
    let direction = $('#directionPulldown').val();

    if (semanticid != -1) {
      let requestURL = '/json/legacy/chorale?semanticid=' + semanticid + '&direction=' + direction;
      $.getJSON(requestURL).done((data) => {
        choraleData = data;
        createConfig(choraleData);
        console.log(data[0]);
        alert('Fetched Data!: data length is ' + data.length);
        // drawHistogram(data, 'count', [0, 500], 20);
        // drawHeatmap(data, 'count', 'lost', [0.0, 400.0], [0.0, 0.3], 10, 10);
      });

      // create template sql.
      let template = ''
      template += 'SELECT\n';
      template += '  COUNT(*) AS elapsedtime\n';
      template += '  ,SUM(e.LOST_ENERGY) AS lost\n';
      template += '  ,SUM(e.CONVERT_LOSS) AS convert_loss\n';
      template += '  ,SUM(e.ENERGY_BY_AIR_RESISTANCE) AS air_loss\n';
      template += '  ,SUM(e.ENERGY_BY_ROLLING_RESISTANCE) AS rolling_loss\n';
      template += '  ,SUM(ABS(e.REGENE_LOSS)) AS regene_loss\n';
      template += '  ,SUM(ABS(e.REGENE_ENERGY)) AS regene_energy\n';
      template += 'FROM\n';
      template += '  ECOLOG_Doppler AS e\n';
      template += '  INNER JOIN SEMANTIC_LINKS AS sl ON e.LINK_ID = sl.LINK_ID\n';
      template += '  INNER JOIN TRIPS_Doppler AS t ON e.TRIP_ID = t.TRIP_ID\n';
      template += 'WHERE\n';
      template += '  sl.SEMANTIC_LINK_ID = \'' + semanticid + '\'\n';
      template += '  AND  t.TRIP_DIRECTION = \'' + direction + '\'\n';
      template += '  AND  t.SENSOR_ID = (\n';
      template += '         SELECT\n';
      template += '           MAX(SENSOR_ID)\n';
      template += '         FROM\n';
      template += '           TRIPS_Doppler AS it\n';
      template += '         WHERE\n';
      template += '           t.TRIP_DIRECTION = it.TRIP_DIRECTION\n';
      template += '           AND  CONVERT(VARCHAR, t.START_TIME, 111) = CONVERT(VARCHAR, it.START_TIME, 111)\n'
      template += '       )\n';
      template += 'GROUP BY\n';
      template += '  t.TRIP_ID';

      $('#sqlbox').val(template);
    }
  })

  $('input[name="graph"]').on('change', () => {
    createConfig(choraleData);
  })

  $('#drawButton').on('click', () => {
    let graphname = $('input[name="graph"]:checked').val();
    console.log(graphname);
    if (graphname === 'histogram') {
      console.log(graphname);
      let xAxisName = $('input[name="xAxisColumn"]:checked').val();
      let xMin = parseFloat($('#xMin').val());
      let xMax = parseFloat($('#xMax').val());
      let xBinsNum = parseInt($('#xBinsNum').val());

      if (Number.isNaN(xMin) || Number.isNaN(xMax) || Number.isNaN(xBinsNum)) {
        alert('Input Number!');
        return;
      }
      drawHistogram(choraleData, xAxisName, [xMin, xMax], xBinsNum);
    } else if (graphname === 'heatmap') {
      let xAxisName = $('input[name="xAxisColumn"]:checked').val();
      let yAxisName = $('input[name="yAxisColumn"]:checked').val();
      let xMin = parseFloat($('#xMin').val());
      let xMax = parseFloat($('#xMax').val());
      let yMin = parseFloat($('#yMin').val());
      let yMax = parseFloat($('#yMax').val());
      let xBinsNum = parseInt($('#xBinsNum').val());
      let yBinsNum = parseInt($('#yBinsNum').val());

      if (Number.isNaN(xMin) || Number.isNaN(xMax) || Number.isNaN(xBinsNum) || Number.isNaN(yMin) || Number.isNaN(yMax) || Number.isNaN(yBinsNum)) {
        alert('input number!');
        return;
      }
      drawHeatmap(choraleData, xAxisName, yAxisName, [xMin, xMax], [yMin, yMax], xBinsNum, yBinsNum);
    } else if (graphname === 'scatter') {
      let xAxisName = $('input[name="xAxisColumn"]:checked').val();
      let yAxisName = $('input[name="yAxisColumn"]:checked').val();
      let colorName = $('input[name="colorColumn"]:checked').val();
      let colorType = $('input[name="colorType"]:checked').val();
      let isContinuousColor;
      if (colorType === 'continuous') {
        isContinuousColor = true;
      } else if (colorType === 'ordinal') {
        isContinuousColor = false;
      } else {
        alert('something wrong with setup color type.');
        return;
      }
      let xMin = parseFloat($('#xMin').val());
      let xMax = parseFloat($('#xMax').val());
      let yMin = parseFloat($('#yMin').val());
      let yMax = parseFloat($('#yMax').val());

      let isNaN = Number.isNaN;
      if (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) {
        alert('input number!');
        return;
      }
      drawScatter(choraleData, xAxisName, yAxisName, [xMin, xMax], [yMin, yMax], colorName, isContinuousColor);
    }
  });

  $('#submitButton').on('click', () => {
    let query = $('#sqlbox').val();
    query = query.replace(/\n/g, ' ');
    query = query.replace(/\t/g, ' ');
    console.log(query);

    let requestURL = '/query?query=' + query;
    // alert('Sorry, custom sql feature have not been implemented.');

    // return;
    $.getJSON(requestURL).done((data) => {
      console.log(data);
      choraleData = data;
      createConfig(choraleData);
      alert('Fetched Data!: data length is ' + data.length);
    }).fail((data) => {
      alert('Error Occured!');
    });
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

function drawSemantic(map, lines, semanticid) {
  // No semantic specified, not need request.
  if (!semanticid) {
    return;
  }

  console.log('will draw semantic');

  let requestURL = '/json/legacy/semantics/?semanticid=' + semanticid;

  $.getJSON(requestURL).done(function(data) {
    console.log(data);
    lines.clearLayers();

    // move map view to semantic link.
    map.setView(data.features[0].geometry.coordinates[0]);

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

// functions which craetes config user interface. 

function createConfig(choraleData) {
  let graphname = $('input[name="graph"]:checked').val();
  console.log(graphname);

  if (graphname === 'histogram') {
    createConfigForHistogram(choraleData);
  } else if (graphname === 'heatmap') {
    createConfigForHeatmap(choraleData);
  } else if (graphname === 'scatter') {
    createConfigForScatter(choraleData);
  }
}

// create config for Histogram
function createConfigForHistogram(data) {
  let graphConfig = $('#graphConfig');
  // clear element.
  graphConfig.empty();

  // create radio box for select x axis column.
  graphConfig.append('<div id="xAxisColumnSelector" class="graphConfigChildren">x Axis Column</div>');
  let xAxisColumnSelector = $('#xAxisColumnSelector');
  if (data.length > 0) {
    Object.keys(data[0]).forEach((columnName, index) => {
      let isSetCheck = false;
      if (index == 0) {
        isSetCheck = true;
      }
      xAxisColumnSelector.append(createRadioBoxStmt('xAxisColumn', columnName, isSetCheck));
    });
  }

  // create x scale input area.
  graphConfig.append('<div id="xAxisRangeInput" class="graphConfigChildren">x Axis Range Input</div>');
  let xAxisRangeInput = $('#xAxisRangeInput');
  xAxisRangeInput.append('<div>x Min<div><input type="text" id="xMin" class="numberbox"></div></div>');
  xAxisRangeInput.append('<div>x Max<div><input type="text" id="xMax" class="numberbox"></div></div>');

  // create input area for decide number of x axis bins.
  graphConfig.append('<div id="xAxisBinsNumInput" class="graphConfigChildren">xAxisBinsNum</div>');
  let xAxisBinsNumInput = $('#xAxisBinsNumInput');
  xAxisBinsNumInput.append('<div><input type="text" id="xBinsNum" class="numberbox"></div>');
}

function createConfigForHeatmap(data) {
  let graphConfig = $('#graphConfig');
  // clear element.
  graphConfig.empty();

  // create radio box for select x axis column.
  graphConfig.append('<div id="xAxisColumnSelector" class="graphConfigChildren">xAixsColumn</div>');
  let xAxisColumnSelector = $('#xAxisColumnSelector');
  if (data.length > 0) {
    Object.keys(data[0]).forEach((columnName, index) => {
      let isSetCheck = false;
      if (index == 0) isSetCheck = true;
      xAxisColumnSelector.append(createRadioBoxStmt('xAxisColumn', columnName, isSetCheck));
    });
  }

  // create x scale input area.
  graphConfig.append('<div id="xAxisRangeInput" class="graphConfigChildren">xAxisRangeInput</div>');
  let xAxisRangeInput = $('#xAxisRangeInput');
  xAxisRangeInput.append('<div>xMin<div><input type="text" id="xMin" class="numberbox"></div></div>');
  xAxisRangeInput.append('<div>xMax<div><input type="text" id="xMax" class="numberbox"></div></div>');

  // add bins selector to below xAxisRangeInput.
  xAxisRangeInput.append('<div>xBisNum<div><input type="text" id="xBinsNum" class="numberbox"></div></div>');

  // create radio box for select y axis column.
  graphConfig.append('<div id="yAxisColumnSelector" class="graphConfigChildren">yAxisColumn</div>');
  let yAxisColumnSelector = $('#yAxisColumnSelector');
  if (data.length > 0) {
    Object.keys(data[0]).forEach((columnName, index) => {
      let isSetCheck = false;
      if (index == 0) isSetCheck = true;
      yAxisColumnSelector.append(createRadioBoxStmt('yAxisColumn', columnName, isSetCheck));
    });
  }

  // create y scale input area.
  graphConfig.append('<div id="yAxisRangeInput" class="graphConfigChildren">yAxisRangeInput</div>');
  let yAxisRangeInput = $('#yAxisRangeInput');
  yAxisRangeInput.append('<div>yMin</div><div><input type="text" id="yMin" class="numberbox"></div>');
  yAxisRangeInput.append('<div>yMax</div><div><input type="text" id="yMax" class="numberbox"></div>');

  // add bins selector to below yAxisRangeInput.
  yAxisRangeInput.append('<div>yBinsNum</div><div><input type="text" id="yBinsNum" class="numberbox"></div>');
}

function createConfigForScatter(data) {
  let graphConfig = $('#graphConfig');
  // clear element.
  graphConfig.empty();

  // create radio box for select x axis column.
  graphConfig.append('<div id="xAxisColumnSelector" class="graphConfigChildren">xAxisColumn</div>');
  let xAxisColumnSelector = $('#xAxisColumnSelector');
  if (data.length > 0) {
    Object.keys(data[0]).forEach((columnName, index) => {
      let isSetCheck = false;
      if (index == 0) {
        isSetCheck = true;
      }
      xAxisColumnSelector.append(createRadioBoxStmt('xAxisColumn', columnName, isSetCheck));
    });
  }

  // create x scale input area.
  graphConfig.append('<div id="xAxisRangeInput" class="graphConfigChildren">xAxisRangeInput</div>');
  let xAxisRangeInput = $('#xAxisRangeInput');
  xAxisRangeInput.append('<div>xMin<div><input type="text" id="xMin" class="numberbox"></div></div>');
  xAxisRangeInput.append('<div>xMax<div><input type="text" id="xMax" class="numberbox"></div></div>');

  // create radio box for select y axis column.
  graphConfig.append('<div id="yAxisColumnSelector" class="graphConfigChildren">yAxisColumn</div>');
  let yAxisColumnSelector = $('#yAxisColumnSelector');
  if (data.length > 0) {
    Object.keys(data[0]).forEach((columnName, index) => {
      let isSetCheck = false;
      if (index == 0) {
        isSetCheck = true;
      }
      yAxisColumnSelector.append(createRadioBoxStmt('yAxisColumn', columnName, isSetCheck));
    });
  }

  // create y scale input area.
  graphConfig.append('<div id="yAxisRangeInput" class="graphConfigChildren">yAxisRangeInput</div>');
  let yAxisRangeInput = $('#yAxisRangeInput');
  yAxisRangeInput.append('<div>yMin<div><input type="text" id="yMin" class="numberbox"></div></div>');
  yAxisRangeInput.append('<div>yMax<div><input type="text" id="yMax" class="numberbox"></div></div>');

  // create radio box for select column for plot color.
  graphConfig.append('<div id="colorColumnSelector" class="graphConfigChildren">colorColumn</div>');
  let colorColumnSelector = $('#colorColumnSelector');
  if (data.length > 0) {
    Object.keys(data[0]).forEach((columnName, index) => {
      let isSetCheck = true;
      if (index == 0) {
        isSetCheck = true;
      }
      colorColumnSelector.append(createRadioBoxStmt('colorColumn', columnName, isSetCheck));
    })
  }

  // create radio box ask color column is continuous or ordinarl
  graphConfig.append('<div id="colorTypeSelector" class="graphConfigChildren">colorColumnType</div>');
  let colorTypeSelector = $('#colorTypeSelector');
  colorTypeSelector.append('<div><input type="radio" name="colorType" value="continuous" checked><label for="colorType">continuous</label></div>');
  colorTypeSelector.append('<div><input type="radio" name="colorType" value="ordinal"><label for="colorType">ordinal</label></div>');
}

// radio box statement generator.
function createRadioBoxStmt (name, columnName, isChecked) {
  let stmt = '<div>';
  stmt += '<input type="radio" name="' + name + '" value="' + columnName + '"';
  if (isChecked) {
    stmt += ' checked'
  }
  stmt += '>'
  stmt += '<label for="' + name + '">' + columnName + '</label></div>'

  return stmt;
}

// d3.js functions

// draw Histogram function
// data: CHORALE Query Result.
// xAxisColumn: Single column name of CHORALE Query
// xAxisRange: 2 element of Array, like [xMin, xMax]. ex.) [0, 500].
// binsNum: Number of bins.
function drawHistogram(data, xAxisColumn, xAxisRange, binsNum) {
  // set drawing area.

  // To avoid remove map's rendering svg area, 
  // specify '#graph svg'. 
  d3.selectAll('#graph svg')
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
        .attr('transform', 'translate(' + margin.left + ', ' + (height - margin.bottom - margin.top) + ')')
        .call(d3.axisBottom(xScale));

  // add the y Axis
  svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + 0 + ')')
        .call(d3.axisLeft(yScale));
}

// draw Heatmap function
function drawHeatmap(data, xAxisColumn, yAxisColumn, xAxisRange, yAxisRange, xBinsNum, yBinsNum) {
  // make Heatmap Data.
  let heatMapData = [];
  for (let i = 0; i < yBinsNum; i++) {
    heatMapData.push(new Array());
    for (let j = 0; j < xBinsNum; j++) {
      heatMapData[i].push(0);
    }
  }

  data.forEach((d) => {
    let xVal = d[xAxisColumn];
    let yVal = d[yAxisColumn];
    if (xAxisRange[0] <= xVal && xVal < xAxisRange[1] && yAxisRange[0] <= yVal && yVal < yAxisRange[1]) {
      xindex = Math.floor((xVal - xAxisRange[0]) / ((xAxisRange[1] - xAxisRange[0]) / xBinsNum));
      yindex = Math.floor((yVal - yAxisRange[0]) / ((yAxisRange[1] - yAxisRange[0]) / yBinsNum));
      heatMapData[yindex][xindex]++;
    }
  });

  // set drawing area.
  d3.selectAll('#graph svg')
      .remove();

  let width = $('#graph').width(),
      height = $('#graph').height(),
      margin = {
        top: 10,
        bottom: 50,
        left: 50,
        right: 10
      }
  let svg = d3.select('#graph').append('svg')
              .attr('width', width)
              .attr('height', height)
  
  let xScale = d3.scaleBand()
                  .rangeRound([margin.left, width - margin.right - margin.left])
                  .domain(d3.range(xBinsNum))
                  .padding(0.05);
  let yScale = d3.scaleBand()
                  .rangeRound([height - margin.bottom, margin.top])
                  .domain(d3.range(yBinsNum))
                  .padding(0.05);

  console.log(yScale);

  let color = d3.scaleSequential((t) => { return d3.interpolate('steelblue', 'red')(t); })
                  .domain([0, d3.max(heatMapData, (row) => { return d3.max(row); })])

  svg.selectAll('.row')
      .data(heatMapData)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => { 
        return 'translate(0, ' + yScale(i) + ')';
      })
      .selectAll('.cell')
      .data((d) => { return d })
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d, i) => {
        return xScale(i);
      })
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('opacity', 0.9)
      .attr('fill', (d) => { return color(d); });

  // draw text.
  svg.selectAll('.labelrow')
      .data(heatMapData)
      .enter()
      .append('g')
      .attr('class', 'labelrow')
      .attr('transform', (d, i) => {
        return 'translate(0, ' + yScale(i) + ')';
      })
      .selectAll('.celllabel')
      .data((d) => { return d })
      .enter()
      .append('text')
      .attr('class', 'celllabel')
      .attr('x', (d, i) => { return xScale(i) + xScale.bandwidth() / 3; })
      .attr('y', (d) => { return yScale.bandwidth() / 2; })
      .text((d) => { return d });

  let xAxis = d3.axisBottom(xScale)
                .tickFormat((i) => {
                  let calc = (index) => { return (index * (xAxisRange[1] - xAxisRange[0]) / xBinsNum + xAxisRange[0]).toFixed(3); }
                  return calc(i);
                });
  let yAxis = d3.axisLeft(yScale)
                .tickFormat((i) => {
                  let calc = (index) => { return (index * (yAxisRange[1] - yAxisRange[0]) / yBinsNum + yAxisRange[0]).toFixed(3); }
                  return calc(i);
                });
  svg.append('g')
        .attr('transform', 'translate(' + (-xScale.bandwidth() / 2) + ', ' + (height - margin.bottom) + ')')
        .call(xAxis);
  svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + (yScale.bandwidth() / 2) + ')')
        .call(yAxis);

}

// draw scatter function
function drawScatter(data, xAxisColumn, yAxisColumn, xAxisRange, yAxisRange, colorColumn, isContinuousColor) {
  // set drawing area.
  d3.selectAll('#graph svg')
    .remove();

  let width = $('#graph').width(),
      height = $('#graph').height(),
      margin = {
        top: 10,
        bottom: 50,
        left:50,
        right: 10
      };

  let svg = d3.select('#graph').append('svg')
              .attr('width', width)
              .attr('height', height);

  let xScale = d3.scaleLinear()
                  .range([margin.left, width - margin.right - margin.left])
                  .domain(xAxisRange);
  let yScale = d3.scaleLinear()
                  .range([height - margin.top - margin.bottom, margin.top])
                  .domain(yAxisRange);

  let color;
  if (isContinuousColor) {
    // continuous scale color
    
    color = d3.scaleSequential(d3.interpolateOranges)
              .domain([ d3.min(data, (row) => { return row[colorColumn]; }), d3.max(data, (row) => { return row[colorColumn]; }) ]);
  } else {
    // ordinal color scale
    color = d3.scaleOrdinal().range(d3.schemeCategory10);
  }

  // draw plots.
  svg.selectAll('circle')
      .data(data)
      .enter().append('circle')
        .attr('cx', (d) => {
          return xScale(d[xAxisColumn]);
        })
        .attr('cy', (d) => {
          return yScale(d[yAxisColumn]);
        })
        .attr('fill', (d) => {
          return color(d[colorColumn]);
        })
        .attr('r', 3)
        .attr('opacity', '0.5');

  // draw x axis.
  svg.append('g')
        .attr('transform', 'translate(' + 0 + ', ' + (height - margin.bottom - margin.top) + ')')
        .call(d3.axisBottom(xScale));

  svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + 0 + ')')
        .call(d3.axisLeft(yScale));
}