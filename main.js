import './app.scss';
import { useMapBox } from './src/js/map';


// hidden block map actions
const showMap = () => {
    const showMapElement = document.getElementById('showMap');
    showMapElement.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxAction').classList.add('hidden');
        // const map = useMapBox();
        // map.setCenter([-99.1332, 19.4326]);
        // map.setZoom(10);
    });
} 

const showShared = () => {
    const showViewShared = document.getElementById('showShared');
    showViewShared.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxShared').classList.add('activeshow');
    });
}

const closeShared = () => {
    const showViewShared = document.getElementById('closeShared');
    showViewShared.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxShared').classList.remove('activeshow');
    });
}

showMap();
showShared();
closeShared();
useMapBox();
