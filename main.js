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

const openCollection = () => {
    document.getElementById('openCollection').addEventListener('click', () => {

        const elementThis = document.getElementById('openCollection');
        const elementTableToggle = document.getElementById('tableData');

        let isVisible = elementTableToggle.style.display !== "block";

        if (isVisible) {
            elementThis.nextElementSibling.classList.add('rotate');
            elementTableToggle.style.display = "block";
            isVisible = true;
          } else {
            elementThis.nextElementSibling.classList.remove('rotate');
            elementTableToggle.style.display = "none";
            isVisible = false;
          }
    });
}

const showAccordion = () => {
    const accordion = document.getElementsByClassName("mapbox_made_accordion_btn");
    let i;

    for (i = 0; i < accordion.length; i++) {
        accordion[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.display === "block") {
            panel.style.display = "none";
            } else {
            panel.style.display = "block";
            }
        });
    }
}

const showMadeMaterial = () => {
    const showMade = document.getElementById('showMaterial');
    showMade.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxMade').classList.add('show');
    });
}

const closeMadeMaterial = () => {
    const closeMade = document.getElementById('closeMadeMaterial');
    closeMade.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mapBoxMade').classList.remove('show');
    });
}

const sliderAnimation = () => {
    const slideIndex = [1, 1, 1, 1, 1, 1];
    const slideId = ["slides_1", "slides_2", "slides_3", "slides_4", "slides_5", "slides_6"];

    const plusSlides = (n, no) => {
        showSlides(slideIndex[no] += n, no);
    }

    // const showSlides = (n, no) => {
    //     let i;
    //     const x = document.getElementsByClassName(slideId[no]);
    //     if (n > x.length) {slideIndex[no] = 1}    
    //     if (n < 1) {slideIndex[no] = x.length}
    //     for (i = 0; i < x.length; i++) {
    //         x[i].style.display = "none";  
    //     }
    //     x[slideIndex[no]-1].style.display = "block";  
    // }

    const showSlides = (n, no) => {
        let i;
        const x = document.getElementsByClassName(slideId[no]);
        if (x.length === 1) { // si hay solo un slide
            x[0].style.display = "block"; // mostrar el único slide
            return; // no agregar botones de navegación
        }
        if (n > x.length) {slideIndex[no] = 1}    
        if (n < 1) {slideIndex[no] = x.length}
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";  
        }
        x[slideIndex[no]-1].style.display = "block";  

        if (no === 4 && x.length === 1) {
            const prevButtons = document.querySelectorAll('.slider_5 .prev');
            const nextButtons = document.querySelectorAll('.slider_5 .next');
            prevButtons.forEach(button => {
                button.style.display = 'none';
            });
            nextButtons.forEach(button => {
                button.style.display = 'none';
            });
        }
    }

    // Busca todos los elementos con clase .prev
    const prevButtons = document.querySelectorAll('.prev');
    // Agrega un event listener a cada botón de previo
    prevButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            plusSlides(-1, index);
        });

        if (index === 4 && document.getElementsByClassName('slides_5').length === 1) {
            button.style.display = 'none';
        }
    });

    // Busca todos los elementos con clase .next
    const nextButtons = document.querySelectorAll('.next');
    // Agrega un event listener a cada botón de siguiente
    nextButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            plusSlides(1, index);
        });

        if (index === 4 && document.getElementsByClassName('slides_5').length === 1) {
            button.style.display = 'none';
        }
    });


    showSlides(1, 0);
    showSlides(1, 1);
    showSlides(1, 2);
    showSlides(1, 3);
    showSlides(1, 4);
    showSlides(1, 5);
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
openCollection();
showAccordion();
sliderAnimation();
closeMadeMaterial();
showMadeMaterial();

window.addEventListener("load", function() {
    const loader = document.querySelector('.loading');
    loader.style.display = 'none';
});
