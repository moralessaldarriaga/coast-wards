import './app.scss';
import { useMapBox } from './src/js/map';
import { getValidationImage } from './src/js/getValidateImage';


// hidden block map actions
const showMap = () => {
    const showMapElement = document.getElementById('showMap');
    showMapElement.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxAction').classList.add('hidden');
        document.querySelector('.mapboxgl_file').style.display = 'flex';
        document.querySelector('.mapboxgl_legend').style.display = 'flex';
    });
} 

const showTerms = () => {
    const showViewTerms = document.getElementById('showTerms');
    showViewTerms.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxTerms').classList.add('show');
    });
}

const closeTerms = () => {
    const closeViewTerms = document.getElementById('closeTerms');
    closeViewTerms.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxTerms').classList.remove('show');
    });
}

// CODIGO COMPARTIR

// const showShared = () => {
//     const showViewShared = document.getElementById('showShared');
//     showViewShared.addEventListener('click', (e) => {
//         e.preventDefault();
//         document.getElementById('mapBoxShared').classList.add('activeshow');
//     });
// }

// const closeShared = () => {
//     const showViewShared = document.getElementById('closeShared');
//     showViewShared.addEventListener('click', (e) => {
//         e.preventDefault();
//         document.getElementById('mapBoxShared').classList.remove('activeshow');
//     });
// }

const openInputFile = () => {
    const element = document.getElementById("useFormPhoto");
    const inputFile = document.getElementById("inputFile");

    element.addEventListener("click", function(e) {
        e.preventDefault();
        inputFile.click();
    });

}

const setImagePost = () => {
    const input = document.querySelector('input[type="file"]');
    const loader = document.createElement('div');
    const innerApp = document.querySelector('.mapbox'); 

    loader.setAttribute('id', 'mapboxValidation');
    loader.classList.add('mapbox_validation');
    loader.innerHTML = '<div class="main_content">' + 
        '<h2>Validando tu imagen ... (Esto llevará unos segundos nada más)</h2>' +
        '<div class="loader"><span class="loader_pulse"></span></div>' +
    '</div>';
    // loader.style. = 'none';
    innerApp.appendChild(loader);

    input.addEventListener('change', () => {

        const file = input.files[0];
        const formData = new FormData();
        formData.append('image', file);
      
        getValidationImage(formData, loader, file);

    });
}

const returnHome = () => {
    const btnReturn = document.getElementById('mapBoxReturnHome');

    btnReturn.addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('mapBoxCoordinates').classList.remove('show');
        document.getElementById('mapBoxAction').querySelector('h1').style.display = 'block';
        document.getElementById('mapBoxAction').classList.remove('hidden');
        document.querySelector('.err_block').remove();
    });
}

showMap();
showTerms();
closeTerms();
// showShared();
// closeShared();
openInputFile();
setImagePost();
returnHome();
useMapBox();
