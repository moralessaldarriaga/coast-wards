// import mapboxgl from 'mapbox-gl';
import { useMapBox } from './map';

export const useCloseForm = (marker) => {

    let map = useMapBox();

    document.getElementById('tableData').innerHTML = '';
    document.getElementById('tableData').style.display = 'none';
    document.getElementById('openCollection').nextElementSibling.classList.remove('rotate');

    marker.remove();
    
    map.flyTo({
        center: [-99.1332, 19.4326],
        zoom: 5,
        speed: 5,
        curve: 1,
        essential: true
    });
    // });
}