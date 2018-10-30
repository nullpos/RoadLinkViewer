$(document).ready(function() {
  let map = L.map('map').setView([43.188627611, 141.008331], 18);
  let markers = new Array();

  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 20
    }
  ).addTo( map );

  let mapBounds = map.getBounds();
  //console.log(mapBounds);
  drawLinks(map, markers, mapBounds.getSouth(), mapBounds.getWest(), mapBounds.getNorth(), mapBounds.getEast());
  $('span#zoomValue').html('current map zoom level is ' + map.getZoom() + '. If map zoom level below 15, markers will not be ploted.');

  map.on('moveend', function() {
    mapBounds = map.getBounds();
    //console.log(mapBounds);
    if (map.getZoom() >= 15) {
      drawLinks(map, markers, mapBounds.getSouth(), mapBounds.getWest(), mapBounds.getNorth(), mapBounds.getEast());
    }
    $('span#zoomValue').html('Current map zoom level is ' + map.getZoom() + '. If map zoom level below 15, markers will not be ploted.');
  });
});

function drawLinks(map, markers, latStart, lngStart, latEnd, lngEnd) {
  let requestUrl = '/json/links/vertex/?';
  requestUrl += 'latstart=' + latStart;
  requestUrl += '&lngstart=' + lngStart;
  requestUrl += '&latend=' + latEnd;
  requestUrl += '&lngend=' + lngEnd;

  $.getJSON(requestUrl).done(function(data) {
    //console.log(data);
    markers.forEach(function(marker) {
      map.removeLayer(marker);
    });
    markers = new Array();

    data.forEach(function(record) {
      let popup = L.popup()
                    .setContent(record.LINK_ID);
      let markerColor;
      if (record.NODE) {
        markerColor = '#FF0000';
      } else {
        markerColor = '#3366ff';
      }

      let marker = L.circleMarker([record.LATITUDE, record.LONGITUDE], {
        radius: 3,
        stroke: false,
        fill: true,
        fillColor: markerColor,
        fillOpacity: 0.3
      })
      .bindPopup(popup)
      .addTo(map);

      markers.push(marker);
    })
  })
}