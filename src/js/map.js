import mapboxgl from 'mapbox-gl';
import { getData } from './getMarker';

export const useMapBox = () => {

  const apikey = `pk.eyJ1IjoiZWFjb3N0YXoiLCJhIjoiY2xlb3hlNGhxMDZ4bzNzcXVwanBvNW45MSJ9.bOrLGjKEMDGtdQHMBpelig`;

  mapboxgl.accessToken = apikey;

  if (mapboxgl.supported() === false) {
    alert('Your browser does not support Mapbox GL');
  } else {

    const datos = getData();

    const mapContainer = document.getElementById('mapbox');
    mapContainer.innerHTML = '';

    let map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/eacostaz/clessg7db004101rncxj36i28',
      center: [-99.1332, 19.4326],
      zoom: 5, //5,
      logoPosition: 'bottom-right'
    });
    

    // map.on('styleimagemissing', (e) => {
    //   const id = e.id; // id of the missing image
       
    //   // Check if this missing icon is
    //   // one this function can generate.
    //   const prefix = 'square-rgb-';
    //   if (!id.includes(prefix)) return;
       
    //   // Get the color from the id.
    //   const rgb = id.replace(prefix, '').split(',').map(Number);
       
    //   const width = 20; // The image will be 64 pixels square.
    //   const bytesPerPixel = 4; // Each pixel is represented by 4 bytes: red, green, blue, and alpha.
    //   const data = new Uint8Array(width * width * bytesPerPixel);
       
    //   for (let x = 0; x < width; x++) {
    //     for (let y = 0; y < width; y++) {
    //       const offset = (y * width + x) * bytesPerPixel;
    //       data[offset + 0] = rgb[0]; // red
    //       data[offset + 1] = rgb[1]; // green
    //       data[offset + 2] = rgb[2]; // blue
    //       data[offset + 3] = 255; // alpha
    //     }
    //   }
       
    //   map.addImage(id, { width: width, height: width, data: data });
    // });

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

      datos.then(data => {

        map.addSource('points', {
          type: 'geojson',
          data: data.data
        });
        map.addLayer({
          id: 'circles',
          type: 'circle',
          source: 'points',
          paint: {
            'circle-radius': 10,
            'circle-color': [
              'to-color',
              ['get', 'color']
            ],
            'circle-opacity': 1
          }
        });
      });

    });

    map.on('click', 'circles', function (e) {

      // const coordinates = e.lngLat;
      const coordinates = e.features[0].geometry.coordinates.slice();

      // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      // }

      const coordinatesHtmlPopup = '<div class="popup_info">' +
        '<div class="popup_info_bar">' +
            // '<a rel="noopener noreferrer" class="popup_info_bar_report" title="report image">' + 
            //   '<span class="material-icons material-symbols-outlined"> warning </span>' +
            // '</a>' +
            '<p>' + e.features[0].properties.date + '</p>' +
        '</div>' +
        '<div class="popup_info_image" style="background-image: url(' + e.features[0].properties.image + ')">' +
          '<div class="popup_info_comments">' + e.features[0].properties.comment +'</div>' +
        '</div>' +
        '<div class="popup_info_actions">' + 
          '<div class="popup_info_actions_type" style="background:' + e.features[0].properties.color + ';">' + e.features[0].properties.material +'</div>' +
          '<a href="#" rel="noopener noreferrer" class="popup_info_actions_comments current_not" title="show current comments">' +
            '<span class="material-icons material-symbols-outlined"> chat_bubble </span>' +
          '</a>' +
          '<a href="#" rel="noopener noreferrer" class="popup_info_actions_close" title="close current popup">' +
            '<span class="material-icons material-symbols-outlined"> close </span>' +
          '</a>' +
        '</div>' +
      '</div>';

      const popup = new mapboxgl.Popup({ closeButton: false, anchor: 'bottom' })
        .setLngLat(coordinates)
        .setHTML(coordinatesHtmlPopup)
        .setMaxWidth("500")
        .on('open', () => {
          const popupContainer = document.querySelector('.mapboxgl-popup-content');
          popupContainer.addEventListener('click', (e) => {

            const useThis = e.target.closest(".popup_info_actions_comments");
            const comments = document.querySelector('.popup_info_comments');
            const info = document.querySelector('.popup_info_bar');
            
            if (useThis) {
              e.preventDefault();

              if(useThis.closest('.current_not')) {
                // useThis.innerHTML = 'chat_bubble';
                useThis.children[0].innerHTML = 'chat';
                useThis.classList.remove('current_not');
                comments.classList.add('show');
                info.classList.add('hidden');
              } else {
                useThis.children[0].innerHTML = 'chat_bubble';
                comments.classList.remove('show');
                useThis.classList.add('current_not');
                info.classList.remove('hidden');
              }    
            } 
          });
        });

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
    
    //CREAMOS EL INPUT FILE DENTRO DEL MAPA
    const elementInputFile = document.createElement('a');
    elementInputFile.className = 'mapboxgl_file';
    elementInputFile.innerHTML = '<span class="material-icons material-symbols-outlined">add_a_photo</span>';

    map.getContainer().appendChild(elementInputFile);

    elementInputFile.onclick = function(e) {
      e.preventDefault();
      const inputFile = document.getElementById("inputFile");
      inputFile.click();
    };

    //create element 'legend information' after load mapbox

    const elementLegendInfo = document.createElement('div');
    elementLegendInfo.className = 'mapboxgl_legend';

    datos.then(data => {
      const showCountValue = data.count;

      elementLegendInfo.innerHTML = '<div class="mapboxgl_legend_type">' + 
        '<div class="mapboxgl_legend_item">' +
          '<div class="mapboxgl_legend_dot mapboxgl_legend_dot__sand"></div>' +
          '<p>Arena</p>' +
        '</div>' +
        '<div class="mapboxgl_legend_item">' +
          '<div class="mapboxgl_legend_dot mapboxgl_legend_dot__pebble"></div>' +
          '<p>Piedrecitas</p>' +
        '</div>' +
        '<div class="mapboxgl_legend_item">' +
          '<div class="mapboxgl_legend_dot mapboxgl_legend_dot__rock"></div>' +
          '<p>Roca</p>' +
        '</div>' +
        '<div class="mapboxgl_legend_item">' +
          '<div class="mapboxgl_legend_dot mapboxgl_legend_dot__mud"></div>' +
          '<p>Barro</p>' +
        '</div>' +
        '<div class="mapboxgl_legend_item">' +
          '<div class="mapboxgl_legend_dot mapboxgl_legend_dot__ice"></div>' +
          '<p>Hielo</p>' +
        '</div>' +
        '<div class="mapboxgl_legend_item">' +
          '<div class="mapboxgl_legend_dot mapboxgl_legend_dot__made"></div>' +
          '<p>Hecho por humanos</p>' +
        '</div>' +
      '</div>' +
      '<div class="mapboxgl_legend_count">' + showCountValue + '</div>';
    });

    map.getContainer().appendChild(elementLegendInfo);

    // add cursor pointer
    map.on('mouseenter', 'circles', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // remove cursor pointer
    map.on('mouseleave', 'circles', () => {
      map.getCanvas().style.cursor = '';
    });

    return map;

  }

}
