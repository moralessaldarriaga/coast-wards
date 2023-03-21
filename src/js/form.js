import { usePostForm } from './postForm';
import { useCloseForm } from './closeForm';

let id;
let marker;

const getsData = (idGet, markerGet) => {
    id = idGet;
    marker = markerGet;
} 


// AQUÍ SE ENVIA LA DATA DESDE UN FETCH POST
document.getElementById('sendForm').addEventListener('click', (e) => {
    e.preventDefault();

    document.getElementById('tableData').innerHTML = '';
    document.getElementById('tableData').classList.display = 'none';
    usePostForm(id, marker);
});

// FLUJO CUANDO LA IMAGEN TIENE GPS
export const formApplication = (data, marker, edit = 1) => {

    if(edit) {
        //AGREGO LOS VALORES A LOS INPUTS 
        document.getElementById('mapFormId').value = data.id;
        document.getElementById('mapFormLng').value = data.image.longuitud;
        document.getElementById('mapFormLt').value = data.image.latitude;
    }

    // OBTENEMOS EL ID QUE PROVIENE DE LA API
    const id = data.id; 

    // AQUÍ ENVIAMOS LOS DATOS DEL FORMULARIO AL POST
    getsData(id, marker);

    // AQUÍ SE PUEDE ESCOGER EL DATA TYPE CON VALORES DE LAS OPCIONES MATERIAL
    const parentContentType = document.getElementById('mapBoxGetType');
    parentContentType.addEventListener('click', (e) => {
        const clickedChild = e.target;

        clickedChild.classList.add('active');
        clickedChild.children[0].textContent = 'radio_button_checked';

        const getType = clickedChild.dataset.type;
        const getColor = clickedChild.dataset.color;

        document.getElementById('mapFormMaterial').value = getType;
        document.getElementById('mapFormColor').value = getColor;

        const siblings = Array.from(clickedChild.parentNode.children);
        siblings.forEach((sibling) => {
            if (sibling !== clickedChild) {
                // Aplicar la acción deseada a los elementos hermanos
                sibling.classList.remove('active');
                sibling.children[0].textContent = 'radio_button_unchecked';
            }
        });
    });

    // VALIDACIONES SI EL CHECK ESTA ACTIVO PARA PODER USAR EL BTN DE GUARDAR FORM
    const checkBoxValid = () => {
        const checkBox = document.getElementById("checkTerms");

        document.getElementById('sendForm').style.opacity = .5;
        document.getElementById('sendForm').style.pointerEvents = 'none';

        checkBox.addEventListener("change", function() {
            if (checkBox.checked) {
              document.getElementById('sendForm').style.opacity = 1;
              document.getElementById('sendForm').style.pointerEvents = 'initial';
            } else {
              document.getElementById('sendForm').style.opacity = .5;
              document.getElementById('sendForm').style.pointerEvents = 'none';
            }
        });
    }

    // AQUÍ SE CIERRA EL FORM Y VUELVE AL HOME
    document.getElementById('closeForm').addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('mapBoxForm').classList.remove('show');
        document.getElementById("mapFormComment").value = "";
        document.getElementById('checkTerms').checked = false;


        const parentContentType = document.getElementById('mapBoxGetType');
        const childContentType = parentContentType.querySelectorAll('div');

        childContentType.forEach(function(childContentType) {
            childContentType.classList.remove('active');
            childContentType.querySelector('span').innerHTML = 'radio_button_unchecked';
        });

        document.getElementById('mapBoxAction').querySelector('h1').innerHTML = 'Guardacostas Corona.';
        document.getElementById('mapBoxAction').querySelector('h2').innerHTML = 'Sube una foto y ayuda a la ciencia a monitorear las costas.';
        document.getElementById('mapBoxAction').classList.remove('hidden');

        useCloseForm(marker);
    });
    
    checkBoxValid();


}

// FLUJO CUANDO LA IMAGEN NO TIENE GPS
export const formDraggable = (id, marker, imageCompress) => {

    // AQUÍ ENVIAMOS LOS DATOS DEL FORMULARIO AL POST
    getsData(id, marker);

    // const reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onloadend = function () {
        // const base64String = reader.result;
    document.querySelector('.mapbox_form_information_image').style.backgroundImage = 'url('+ imageCompress + ')';
    // }


    // AQUÍ SE PUEDE ESCOGER EL DATA TYPE CON VALORES DE LAS OPCIONES MATERIAL
    const parentContentType = document.getElementById('mapBoxGetType');
    parentContentType.addEventListener('click', (e) => {
        const clickedChild = e.target;

        clickedChild.classList.add('active');
        clickedChild.children[0].textContent = 'radio_button_checked';

        const getType = clickedChild.dataset.type;
        const getColor = clickedChild.dataset.color;

        document.getElementById('mapFormMaterial').value = getType;
        document.getElementById('mapFormColor').value = getColor;

        const siblings = Array.from(clickedChild.parentNode.children);
        siblings.forEach((sibling) => {
            if (sibling !== clickedChild) {
                // Aplicar la acción deseada a los elementos hermanos
                sibling.classList.remove('active');
                sibling.children[0].textContent = 'radio_button_unchecked';
            }
        });
    });


    // AQUÍ SE CIERRA EL FORM Y VUELVE AL HOME
    document.getElementById('closeForm').addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('mapBoxForm').classList.remove('show');
        document.getElementById("mapFormComment").value = "";
        document.getElementById('checkTerms').checked = false;

        const parentContentType = document.getElementById('mapBoxGetType');
        const childContentType = parentContentType.querySelectorAll('div');

        childContentType.forEach(function(childContentType) {
            childContentType.querySelector('span').innerHTML = 'radio_button_unchecked';
            childContentType.classList.remove('active');
        });
        

        useCloseForm(marker);

        document.getElementById('mapBoxAction').querySelector('.err_block').remove();
        document.getElementById('mapBoxAction').querySelector('h1').style.display = 'block';
        document.getElementById('mapBoxAction').querySelector('h2').style.display = 'block';
        document.getElementById('mapBoxAction').classList.remove('hidden');

    });


    // VALIDACIONES SI EL CHECK ESTA ACTIVO PARA PODER USAR EL BTN DE GUARDAR FORM
    const checkBoxValid = () => {
        const checkBox = document.getElementById("checkTerms");

        document.getElementById('sendForm').style.opacity = .5;
        document.getElementById('sendForm').style.pointerEvents = 'none';

        checkBox.addEventListener("change", function() {
            if (checkBox.checked) {
              document.getElementById('sendForm').style.opacity = 1;
              document.getElementById('sendForm').style.pointerEvents = 'initial';
            } else {
              document.getElementById('sendForm').style.opacity = .5;
              document.getElementById('sendForm').style.pointerEvents = 'none';
            }
        });
    }

    checkBoxValid();
}