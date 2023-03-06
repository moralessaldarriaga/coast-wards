import mapboxgl from 'mapbox-gl';
import { getData } from './getMarker';

export const useMapBox = () => {

  const apikey = `pk.eyJ1IjoiZWFjb3N0YXoiLCJhIjoiY2xlb3hlNGhxMDZ4bzNzcXVwanBvNW45MSJ9.bOrLGjKEMDGtdQHMBpelig`;

  mapboxgl.accessToken = apikey;

  // const markerSource = {
  //   type: 'geojson',
  //   data: {
  //     type: 'FeatureCollection',
  //     features: [
  //       {
  //         type: 'Feature',
  //         geometry: {
  //           type: 'Point',
  //           coordinates: [-99.1332, 19.4326]
  //         },
  //         properties: {
  //           image: 'https://placekitten.com/g/200/200',
  //           date: 'July 2023',
  //           comment: 'Lorem ipsum, lorem ipsum, lorem ipsum'
  //         }
  //       },
  //       {
  //         type: 'Feature',
  //         geometry: {
  //           type: 'Point',
  //           coordinates: [-103.3500, 20.6667]
  //         },
  //         properties: {
  //           image: 'https://placekitten.com/g/200/200',
  //           date: 'July 2023',
  //           comment: 'Lorem ipsum, lorem ipsum, lorem ipsum'
  //         }
  //       },
  //       {
  //         type: 'Feature',
  //         geometry: {
  //           type: 'Point',
  //           coordinates: [-100.3167, 25.6667]
  //         },
  //         properties: {
  //           image: 'https://placekitten.com/g/200/200',
  //           date: 'July 2023',
  //           comment: 'Lorem ipsum, lorem ipsum, lorem ipsum'
  //         }
  //       },
  //     ]
  //   }
  // };

  if (mapboxgl.supported() === false) {
    alert('Your browser does not support Mapbox GL');
  } else {

    const mapContainer = document.getElementById('mapbox');
    mapContainer.innerHTML = '';

    const map = new mapboxgl.Map({
      container: 'mapbox',
      style: 'mapbox://styles/eacostaz/clessg7db004101rncxj36i28',
      center: [-99.1332, 19.4326],
      zoom: 5 //5
    });

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      getData().then(data => {
        map.addLayer({
          id: 'markers',
          type: 'symbol',
          source: {
            type: 'geojson',
            data: data
          },
          layout: {
            'icon-image': 'marker-15'
          },
        });
      });
    });

    map.on('click', 'markers', function (e) {

      // const coordinates = e.lngLat;
      const coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const coordinatesHtmlPopup = '<div class="popup_info">' +
        '<div class="popup_info_bar">' +
            '<a rel="noopener noreferrer" class="popup_info_bar_report" title="report image">' + 
              '<span class="material-icons material-symbols-outlined"> warning </span>' +
            '</a>' +
            '<p>' + e.features[0].properties.date + '</p>' +
        '</div>' +
        '<div class="popup_info_image" style="background-image: url(' + e.features[0].properties.image + ')"></div>' +
        '<div class="popup_info_actions">' + 
          '<div class="popup_info_actions_type">' + e.features[0].geometry.type +'</div>' +
            '<a href="#" rel="noopener noreferrer" class="popup_info_actions_close" title="close current popup">' +
              '<span class="material-icons material-symbols-outlined"> close </span>' +
            '</a>' +
          '</div>' +
      '</div>';

      const popup = new mapboxgl.Popup({ closeButton: false, anchor: 'bottom' })
        .setLngLat(coordinates)
        .setHTML(coordinatesHtmlPopup)
        .setMaxWidth("500");
        // .setMaxHeight("600px");

      popup.addTo(map);

      map.flyTo({
        center: coordinates,
        offset: [0, 200],
        zoom: 6,
        speed: 1,
        curve: 1.5,
        essential: true
      });

      const popupClose = document.querySelectorAll(".popup_info_actions_close");

      popupClose.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault(); // Evita que la etiqueta se comporte como un enlace y recargue la página  
          popup.remove();
        });
      });

    });
    
    map.on('mouseenter', 'markers', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'markers', () => {
      map.getCanvas().style.cursor = '';
    });


    return map;
    // let lastZoom = map.getZoom();

    // map.on('zoom', () => {
    //   const currentZoom = map.getZoom();
    //   if (currentZoom > lastZoom) {
    //     console.log(1);
    //   } else {
    //     console.log(2);
    //   }
    
    //   lastZoom = currentZoom;
    // });
  }

}
