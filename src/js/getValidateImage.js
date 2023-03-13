import mapboxgl from 'mapbox-gl';
import { useMapBox } from './map';
import { formApplication, formDraggable } from './form';
import imageIcoMarket from '../images/ico_marker.svg';

export const getValidationImage = async(formData, loader, file) => {
    try {

        document.getElementById("inputFile").value = null;
        loader.classList.add('show');
        document.getElementById('mapBoxAction').classList.add('hidden');

        const response = await fetch('https://coastwards.labsourcing.com/api/contribute', {
            method: 'POST',
            body: formData
        });

        if (response.ok) { 

            const data = await response.json();


            // AQUÍ MANEJAMOS EVENTOS CON LA RESP DEL SERVIDOR
            loader.classList.remove('show');
            document.getElementById('mapBoxAction').querySelector('h1').style.display = 'block';
            
            let errorElement = document.querySelector('.err_block');

            if (errorElement) {
                errorElement.remove();
            }

            let map = useMapBox();
            
            map.on('load', () => {

                document.querySelector('.mapboxgl_legend').style.display = 'none';
                document.querySelector('.mapboxgl_file').style.display = 'none';

                // SE CREA EL MARKER CON LAS COORDENADAS
                const marker = new mapboxgl.Marker({
                    element: document.createElement('div'),
                })
                .setLngLat([data.marked.geometry.coordinates[0], data.marked.geometry.coordinates[1]])
                .addTo(map);

                marker.getElement().innerHTML = '<img src="'+ imageIcoMarket + '" width="50" height="50" />';

                map.flyTo({
                    center: marker.getLngLat(),
                    zoom: 14,
                    speed: 1.5,
                    curve: 1,
                    essential: true
                });

                //SE CREA EL CONTENEDOR CON LOS BOTONES DE ACCIONES 
                const elementBtns = document.createElement('div');
                elementBtns.className = 'mapboxgl_snackbar mapboxgl_snackbar__response';
                elementBtns.id = 'mapboxglFirstActions';
                elementBtns.innerHTML = '<p>¿La ubicación se ve bien?</p>' +
                '<div class="mapboxgl_snackbar_actions">' +
                    '<a href="#" rel="noopener noreferrer" id="setZoomMap" class="btn btn__border">No</a>' +
                    '<a href="#" rel="noopener noreferrer" id="setFormMap" class="btn btn__blue">Si</a>' +
                '</div>';

                map.getContainer().appendChild(elementBtns);

                let newMarker;

                // HACEMOS CLICK EN EL BOTON PARA REALIZAR EN EVENTO DE DRAG EN EL MAPA
                const setZoomMap = document.getElementById('setZoomMap');
                setZoomMap.addEventListener('click', function(e) {
                    e.preventDefault();

                    marker.remove();

                    const snackBarFirstActions = document.getElementById('mapboxglFirstActions');
                    snackBarFirstActions.parentNode.removeChild(snackBarFirstActions);

                    // CREAMOS EL NUEVO BLOQUE CON BOTONES DE ACCIONES
                    const elementNewBtns = document.createElement('div');
                    elementNewBtns.className = 'mapboxgl_snackbar mapboxgl_snackbar__edit';
                    elementNewBtns.id = 'mapboxglNewActions';
                    elementNewBtns.innerHTML = '<p>¡Haz zoom hasta que el marcador se vuelva verde y apunte a la ubicación en la que tomaste esta foto!</p>' +
                    '<div class="mapboxgl_snackbar_actions">' +
                        '<a href="#" rel="noopener noreferrer" id="setNewReturnHome" class="btn btn__border">Cancelar</a>' +
                        '<a href="#" rel="noopener noreferrer" id="setNewFormMap" class="btn btn__blue">Coloca la imagen</a>' +
                    '</div>';

                    map.getContainer().appendChild(elementNewBtns);

                    // DESDE AQUÍ PODEMOS CREAR EL MARKER E INTERACTURAR CON EL DRAG
                    const el = document.createElement('div');

                     // CARGAMOS LA IMAGEN DEL FILE 
                     const readerFile = new FileReader();
                     readerFile.readAsDataURL(file);
                     readerFile.onloadend = function () {
                         const base64Reader = readerFile.result;
                         el.innerHTML = '<div class="mapboxgl_image_bg" style="background-image: url(' + base64Reader + ');"></div><div class="mapboxgl_image_light"></div><div class="mapboxgl_image_tool"><div class="mapboxgl_image_tool_tip"></div></div>';
                     }
                     el.style.width = '200px';
                     el.style.height = '200px';
                     
                     newMarker = new mapboxgl.Marker({
                         element: el
                     })
                     .setLngLat(map.getCenter())
                     .addTo(map);

                     newMarker.getElement().classList.add('mapboxgl_image');
                     
                     // marker.setDraggable(true);
 
                    const onDragEnd = () => {
                         const lngLat = newMarker.getLngLat();
                         newMarker.setLngLat(map.getCenter());
                         document.getElementById('mapFormLng').value = lngLat.lng;
                         document.getElementById('mapFormLt').value = lngLat.lat;
                     }

                     const zoomValid = () => {
                        // Obtener el nivel de zoom actual
                        const zoom = map.getZoom();
    
                        // Verificar si el nivel de zoom está dentro del rango especificado
                        if (zoom > 14) {
                            newMarker.getElement().querySelector('.mapboxgl_image_light').style.background = '#03C988';
                            newMarker.getElement().querySelector('.mapboxgl_image_tool_tip').style.borderColor = '#03C988 transparent transparent transparent';
                            document.getElementById('setNewFormMap').style.pointerEvents = 'initial';
                            document.getElementById('setNewFormMap').style.opacity = '1';
                        } else {    
                            newMarker.getElement().querySelector('.mapboxgl_image_light').style.background = '#EB455F';
                            newMarker.getElement().querySelector('.mapboxgl_image_tool_tip').style.borderColor = '#EB455F transparent transparent transparent';
                           
                            const setSearchMapFind = document.getElementById('setNewFormMap');
                            if (setSearchMapFind) {
                                setSearchMapFind.style.pointerEvents = 'none';
                                setSearchMapFind.style.opacity = '.5';
                            }
                        }
                    }

                     map.on('drag', onDragEnd);

                     map.on('zoom', onDragEnd);
     
                     map.on('zoomend', zoomValid);


                    document.getElementById('setNewFormMap').addEventListener('click', () => {
                        // MOSTRAMOS EL FORMULARIO, MOSTRAMOS LA IMAGEN Y ELIMINAMOS EL CONTENEDOR CON LOS BOTONES DE ACCION
                        document.getElementById('mapBoxForm').classList.add('show');
                        document.querySelector('.mapboxgl_snackbar').remove();
                        document.querySelector('.mapbox_form_information_image').style.backgroundImage = 'url('+ data.marked.properties.image +')';

                        formApplication(data, newMarker, 0);
                    });

                    // RETORNAR A LA VIEW HOME
                    const setNewReturnHome = document.getElementById('setNewReturnHome');
                    setNewReturnHome.addEventListener('click', function(e) {
                        e.preventDefault();

                        const snackBar = document.querySelector('.mapboxgl_snackbar');
                        if (snackBar) {
                            snackBar.parentNode.removeChild(snackBar);
                        }

                        const errBlock = document.getElementById('mapBoxAction').querySelector('.err_block');
                        if (errBlock) {
                            errBlock.remove();
                        }

                        document.getElementById('mapBoxAction').classList.remove('hidden');
                        document.getElementById('mapBoxAction').querySelector('h1').style.display = 'block';

                        newMarker.remove();

                        map.flyTo({
                            center: [-99.1332, 19.4326],
                            zoom: 5, //5,
                            speed: 1.5,
                            curve: 1,
                            essential: true
                        });

                    });
                });


                // PASAMOS LOS DATOS A LOS PARAMETROS DEL FUNCTION
                const setSearchMap = document.getElementById('setFormMap');
                setSearchMap.addEventListener('click', (e) => {
                    e.preventDefault();
                    // MOSTRAMOS EL FORMULARIO, MOSTRAMOS LA IMAGEN Y ELIMINAMOS EL CONTENEDOR CON LOS BOTONES DE ACCION
                    document.getElementById('mapBoxForm').classList.add('show');
                    document.querySelector('.mapboxgl_snackbar').remove();
                    document.querySelector('.mapbox_form_information_image').style.backgroundImage = 'url('+ data.marked.properties.image +')';
                    
                    formApplication(data, marker);
                });

            });
            

        } else { 

            const errorObj = await response.json();
            
            document.getElementById('mapBoxAction').querySelector('h1').style.display = 'none';

            let errorElement = document.querySelector('.err_block');

            if (!errorElement) {
                // Si no existe, lo creamos y lo insertamos
                errorElement = document.createElement('div');
                errorElement.classList.add('err_block');
                document.getElementById('mapBoxAction').insertBefore(errorElement, document.getElementById('mapBoxAction').firstChild);
            }
        
            errorElement.innerHTML = '<h2>' + errorObj.message + '</h2>';
        
            loader.classList.remove('show');
            document.getElementById('mapBoxAction').classList.remove('hidden');

            if(errorObj.code === 'NOTPOINT') {

                const viewSearchCoordinate = document.getElementById('mapBoxCoordinates');
                viewSearchCoordinate.classList.add('show');
                document.getElementById('mapBoxAction').classList.add('hidden');

                // AQUÍ SE CARGA EL MARKER PARA ESCOGER TU UBICACION EN EL MAPA Y SEGUIR CON EL FLUJO
                
                let handleSetCoordinatesClickRegister = false;

                const mapBoxSearchCoordinate = document.getElementById('mapBoxSearchCoordinate');

                const handleSetCoordinatesClick = (e) => {

                    if (!handleSetCoordinatesClickRegister) {
                        console.log('hicis click al padre');

                        handleSetCoordinatesClickRegister = true;

                        e.preventDefault();

                        document.getElementById('mapBoxCoordinates').classList.remove('show');

                        let map = useMapBox();

                        map.on('load', () => {
                            document.querySelector('.mapboxgl_legend').style.display = 'none';
                            document.querySelector('.mapboxgl_file').style.display = 'none';

                            let elementBtnsSearch = document.querySelector('.mapboxgl_snackbar');

                            if(!elementBtnsSearch) {

                                //CREAMOS EL CONTENEDOR CON LOS BOTONES A EJECUTAR 
                                elementBtnsSearch = document.createElement('div');
                                elementBtnsSearch.className = 'mapboxgl_snackbar mapbox_gl_snackbar_locating';
                                elementBtnsSearch.innerHTML = '<p>¡Haz zoom hasta que el marcador se vuelva verde y apunte a la ubicación en la que tomaste esta foto!</p>' +
                                '<div class="mapboxgl_snackbar_actions">' +
                                    '<a href="#" rel="noopener noreferrer" id="setReturnHome" class="btn btn__border">Cancelar subida</a>' +
                                    '<a href="#" rel="noopener noreferrer" id="setSearchMap" class="btn btn__blue" style="pointer-events: none; opacity: 0.5;">Coloca la imagen</a>' +
                                '</div>';
                            
                                map.getContainer().appendChild(elementBtnsSearch);
                            }

                            // DESDE AQUÍ PODEMOS CREAR EL MARKER E INTERACTURAR CON EL DRAG
                            const el = document.createElement('div');

                            // CARGAMOS LA IMAGEN DEL FILE 
                            const readerFile = new FileReader();
                            readerFile.readAsDataURL(file);
                            readerFile.onloadend = function () {
                                const base64Reader = readerFile.result;
                                el.innerHTML = '<div class="mapboxgl_image_bg" style="background-image: url(' + base64Reader + ');"></div><div class="mapboxgl_image_light"></div><div class="mapboxgl_image_tool"><div class="mapboxgl_image_tool_tip"></div></div>';
                            }
                            el.style.width = '200px';
                            el.style.height = '200px';
                            
                            const marker = new mapboxgl.Marker({
                                element: el
                            })
                            .setLngLat(map.getCenter())
                            .addTo(map);

                            marker.getElement().classList.add('mapboxgl_image');
                            
                            // marker.setDraggable(true);
        
                            const onDragEnd = () => {
                                const lngLat = marker.getLngLat();
                                marker.setLngLat(map.getCenter());
                                document.getElementById('mapFormLng').value = lngLat.lng;
                                document.getElementById('mapFormLt').value = lngLat.lat;
                            }

                            const zoomValidate = () => {
                                // Obtener el nivel de zoom actual
                                const zoom = map.getZoom();
            
                                // Verificar si el nivel de zoom está dentro del rango especificado
                                if (zoom > 14) {
                                    marker.getElement().querySelector('.mapboxgl_image_light').style.background = '#03C988';
                                    marker.getElement().querySelector('.mapboxgl_image_tool_tip').style.borderColor = '#03C988 transparent transparent transparent';
                                    document.getElementById('setSearchMap').style.pointerEvents = 'initial';
                                    document.getElementById('setSearchMap').style.opacity = '1';
                                } else {    
                                    marker.getElement().querySelector('.mapboxgl_image_light').style.background = '#EB455F';
                                    marker.getElement().querySelector('.mapboxgl_image_tool_tip').style.borderColor = '#EB455F transparent transparent transparent';
                                
                                    const setSearchMapFind = document.getElementById('setSearchMap');
                                    if (setSearchMapFind) {
                                        setSearchMapFind.style.pointerEvents = 'none';
                                        setSearchMapFind.style.opacity = '.5';
                                    }
                                }
                            }

                            map.on('drag', onDragEnd);

                            map.on('zoom', onDragEnd);
            
                            map.on('zoomend', zoomValidate);


                            // RETORNAR A LA VIEW HOME
                            const setReturnHome = document.getElementById('setReturnHome');
                            setReturnHome.addEventListener('click', function(e) {
                                e.preventDefault();

                                const snackBar = document.querySelector('.mapboxgl_snackbar');
                                if (snackBar) {
                                    snackBar.parentNode.removeChild(snackBar);
                                }

                                const errBlock = document.getElementById('mapBoxAction').querySelector('.err_block');
                                if (errBlock) {
                                    errBlock.remove();
                                }

                                document.getElementById('mapBoxAction').classList.remove('hidden');
                                document.getElementById('mapBoxAction').querySelector('h1').style.display = 'block';

                                marker.remove();

                                map.flyTo({
                                    center: [-99.1332, 19.4326],
                                    zoom: 5, //5,
                                    speed: 1.5,
                                    curve: 1,
                                    essential: true
                                });

                            });

                            //probando manejador de eventos
                            const setSearchMap = document.getElementById('setSearchMap');
                            
                            const handleClick = (e) => {

                                console.log('hicimos click');
                                e.preventDefault();

                                marker.remove();

                                const snackBar = document.querySelector('.mapboxgl_snackbar');
                                if (snackBar) {
                                    snackBar.parentNode.removeChild(snackBar);
                                }

                                document.getElementById('mapBoxForm').classList.add('show');

                                const formData = new FormData();
                                const getLatitude = document.getElementById('mapFormLng').value;
                                const getLongitude = document.getElementById('mapFormLt').value;

                                formData.append('image', file);
                                formData.append('latitude', getLatitude);
                                formData.append('longitude', getLongitude);

                                fetch('https://coastwards.labsourcing.com/api/contribute', {
                                    method: 'POST',
                                    body: formData
                                })
                                .then((response) => response.json())
                                .then((data) => formDraggable(data.id, marker, file));

                                // setSearchMap.removeEventListener('click', handleClick);
                                // setSearchMap.addEventListener('click', handleClick);
                            }

                            setSearchMap.addEventListener('click', handleClick);


                            // AQUÍ DEBEMOS CARGAR EL MAPA CON EL MARKER DRAGGABLE PARA MANDAR LOS DATOS AL FORMULARIO
                            // const setSearchMap = document.getElementById('setSearchMap');
                            // setSearchMap.addEventListener('click', function(e) {
                            //     e.preventDefault();

                            //     marker.remove();

                            //     const snackBar = document.querySelector('.mapboxgl_snackbar');
                            //     if (snackBar) {
                            //         snackBar.parentNode.removeChild(snackBar);
                            //     }
                                
                            //     document.getElementById('mapBoxForm').classList.add('show');

                            //     const formData = new FormData();
                            //     const getLatitude = document.getElementById('mapFormLng').value;
                            //     const getLongitude = document.getElementById('mapFormLt').value;

                            //     formData.append('image', file);
                            //     formData.append('latitude', getLatitude);
                            //     formData.append('longitude', getLongitude);

                            //     fetch('https://coastwards.labsourcing.com/api/contribute', {
                            //         method: 'POST',
                            //         body: formData
                            //     })
                            //     .then((response) => response.json())
                            //     .then((data) => formDraggable(data.id, marker, file));

                            // });
            
                        });
                    }
                }

                mapBoxSearchCoordinate.addEventListener("click", handleSetCoordinatesClick);

            }

        }


    } catch (error) {
        console.log(error);
    }
}
