// import mapboxgl from 'mapbox-gl';
import { useMapBox } from './map';
// import { getData } from './getMarker';

export const usePostForm = (id, marker) => {

    // agregando el loader
    const loader = document.getElementById('mapboxValidation');
    const mapActions = document.getElementById('mapBoxAction');
    const mapForm = document.getElementById('mapBoxForm');
    loader.classList.add('show');
    mapForm.classList.remove('show');

    // const dataId = document.getElementById('mapFormId').value;
    const url = 'http://stagingback.guardacostascorona.com/api/contribute/'+ id;

    const dataType = document.getElementById('mapFormMaterial').value;
    const dataComment = document.querySelector('#mapFormComment').value;
    const dataLng = document.getElementById('mapFormLng').value;
    const dataLt = document.getElementById('mapFormLt').value;
    const dataColor = document.getElementById('mapFormColor').value;

    let data = JSON.stringify({
        'material': dataType,
        'comment': dataComment,
        'longitude': dataLng,
        'latitude': dataLt,
        'color' : dataColor
    })

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    
    .then(response => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text(); // Devuelve una cadena de texto
        }
        return response.json();
    })
    .then(data => {

        id = null;

        document.getElementById('checkTerms').checked = false;
        document.getElementById('mapFormComment').value = '';

        const parentContentType = document.getElementById('mapBoxGetType');
        const childContentType = parentContentType.querySelectorAll('div');

        childContentType.forEach(function(childContentType) {
            childContentType.querySelector('span').innerHTML = 'radio_button_unchecked';
            childContentType.classList.remove('active');
        });

        let map = useMapBox();
        
        map.flyTo({
            center: [-99.1332, 19.4326],
            zoom: 5,
            speed: 5,
            curve: 1,
            essential: true
        });        

    })
    .catch(error => {
        console.error(error)
    })
    .finally(() => {
        loader.classList.remove('show');
        mapActions.querySelector('h1').style.display = 'block';
        mapActions.querySelector('h1').innerHTML = '¡¡GENIAL!! Tu imagen se ha subido. ¡Otra! :)';
        mapActions.classList.remove('hidden');
    
        if (mapActions.querySelector('.err_block') !== null) {
            // Si existe, removerlo del DOM
            mapActions.querySelector('.err_block').remove();
        }
    });
}