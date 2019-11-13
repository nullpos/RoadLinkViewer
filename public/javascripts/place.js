// set Access Token (defined in key.js)
mapboxgl.accessToken = window.keys['mapbox']

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: [139.5917861, 35.4723189], // starting position [lng, lat]
  zoom: 14 // starting zoom
});

const placeList = {}
// https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/
map.on('load', function() {
  fetch('/json/place').then((res) => {
    return res.json()
  }).then((json) => {
    const pulldown = document.getElementById('pulldown')
    // create pulldown box
    for(let i in json) {
      const feature = json[i]
      const el = document.createElement('option')
      el.textContent = feature['PLACE_NAME']
      pulldown.appendChild(el)
      const centerPoint = [
        (feature['START_LONGITUDE'] + feature['END_LONGITUDE']) / 2,
        (feature['START_LATITUDE'] + feature['END_LATITUDE']) / 2,
      ]
      placeList[feature['PLACE_NAME']] = centerPoint

      // add polygon layer to map
      map.addLayer({
        'id': feature['PLACE_NAME'],
        'type': 'fill',
        'layout': {},
        'paint': {
          'fill-color': '#800',
          'fill-opacity': 0.5
        },
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': [
                [
                  [feature['START_LONGITUDE'], feature['START_LATITUDE']],
                  [feature['START_LONGITUDE'], feature['END_LATITUDE']],
                  [feature['END_LONGITUDE'],   feature['END_LATITUDE']],
                  [feature['END_LONGITUDE'],   feature['START_LATITUDE']],
                ]
              ]
            }
          }
        }
      })

      // add popup
      const popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(centerPoint)
        .setHTML(`<span>${feature['PLACE_NAME']}</span>`)
        .addTo(map);
    }
    pulldown.addEventListener('change', (e) => {
      const placeName = pulldown.value
      map.setCenter(placeList[placeName])
    })
    
  })
})