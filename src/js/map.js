import mapboxgl from 'mapbox-gl';

export const useMapBox = () => {

  const apikey = `pk.eyJ1IjoiZWFjb3N0YXoiLCJhIjoiY2xlb3hlNGhxMDZ4bzNzcXVwanBvNW45MSJ9.bOrLGjKEMDGtdQHMBpelig`;

  mapboxgl.accessToken = apikey;

  const geojson = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {
          'message': 'Demo Edgar',
          'iconSize': [60, 60]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [-60.324462, -18.024695]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'message': 'Foo',
          'iconSize': [60, 60]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [-66.324462, -16.024695]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'message': 'Bar',
          'iconSize': [50, 50]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [-61.21582, -15.971891]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'message': 'Baz',
          'iconSize': [40, 40]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [-63.292236, -18.281518]
        }
      }
    ]
  };

  if (mapboxgl.supported() === false) {
    alert('Your browser does not support Mapbox GL');
  } else {
    const map = new mapboxgl.Map({
      container: 'mapbox',
      projection: 'mercator',
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-65.017, -16.457],
      zoom: 0
    });

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
  
      for (const marker of geojson.features) {
        // Create a DOM element for each marker.
        const el = document.createElement('div');
        const width = marker.properties.iconSize[0];
        const height = marker.properties.iconSize[1];
        el.className = 'marker';
        el.style.backgroundImage = `url(https://placekitten.com/g/${width}/${height}/)`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.backgroundSize = '100%';
        
        el.addEventListener('click', () => {
          map.flyTo({
            center: marker.geometry.coordinates,
            zoom: 3,
            speed: 1
          });
        });
        
        // Add markers to the map.
        new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
          .setHTML(
            `<h3>${marker.properties.title}</h3><p>${marker.properties.message}</p>`
          )
        )
        .addTo(map);
      }
    });
  }

}
