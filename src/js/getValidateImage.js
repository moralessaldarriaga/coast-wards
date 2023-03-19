import mapboxgl from 'mapbox-gl';
import { useMapBox } from './map';
import { formApplication, formDraggable } from './form';
import imageIcoMarket from '../images/ico_marker.svg';

export const getValidationImage = async(formData, loader, file) => {
    try {

        document.getElementById("inputFile").value = null;
        loader.classList.add('show');
        document.getElementById('mapBoxAction').classList.add('hidden');

        const response = await fetch('https://stagingback.guardacostascorona.com/api/contribute', {
            method: 'POST',
            body: formData
        });

        if (response.ok) { 

            const data = await response.json();

            console.log(data);


            // AQUÍ MANEJAMOS EVENTOS CON LA RESP DEL SERVIDOR
            loader.classList.remove('show');
            document.getElementById('mapBoxAction').querySelector('h1').style.display = 'block';
            document.getElementById('mapBoxAction').querySelector('h2').style.display = 'block';

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
                elementBtns.innerHTML = '<p>¡Muy bien! ¿La ubicación es correcta?</p>' +
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

                        //creamos la tabla con los metadatos
                        const elementTable = document.createElement('table');
                        const elementTablePadre = document.getElementById('tableData')
                        elementTable.innerHTML = `<table>
                            <tr>
                            <th>DIRECCIÓN IP</th>
                            <th></th>
                            </tr>
                            <tr>
                            <td>DIRECCIÓN IP</td>
                            <td>We will save your IP Address upon upload</td>
                            </tr>
                            <tr>
                            <th>IMAGEN</th>
                            <th></th>
                            </tr>
                            <tr>
                            <td>IMAGEN</td>
                            <td>Guardamos la imagen con un ancho de 800 píxeles y eliminamos los metadatos</td>
                            </tr>
                            <tr>
                            <td>Identificador único</td>
                            <td>${data.image.uid}</td>
                            </tr>
                            <tr>
                            <td>Latitud</td>
                            <td>${data.image.latitude}</td>
                            </tr>
                            <tr>
                            <td>Longitud</td>
                            <td>${data.image.longuitud}</td>
                            </tr>
                            <tr>
                            <td>Localización manual</td>
                            <td>${data.image.manual}</td>
                            </tr>
                            <tr>
                            <td>Localización correcta</td>
                            <td>${data.image.corrected}</td>
                            </tr>
                            <tr>
                            <td>Date/Time</td>
                            <td>${data.image.datetime}</td>
                            </tr>
                            <tr>
                            <th>ANOTACIONES</th>
                            <th>PUNTAJE</th>
                            </tr>
                            <tr>
                            <td>Planta</td>
                            <td>${data.labels[3].score ? data.labels[3].score : ''}</td>
                            </tr>
                            <tr>
                            <td>Cielo</td>
                            <td>${data.labels[1].score ? data.labels[1].score : ''}</td>
                            </tr>
                            <tr>
                            <td>Madera</td>
                            <td>0</td>
                            </tr>
                            <tr>
                            <td>Base</td>
                            <td>0</td>
                            </tr>
                            <tr>
                            <td>Muro</td>
                            <td>0</td>
                            </tr>
                            <tr>
                            <td>Nube</td>
                            <td>${data.labels[0].score ? data.labels[0].score : ''}</td>
                            </tr>
                            <tr>
                            <td>Pared de piedra</td>
                            <td>0</td>
                            </tr>
                            <tr>
                            <td>Paisaje</td>
                            <td>${data.labels[8].score ? data.labels[8].score : ''}</td>
                            </tr>
                            <tr>
                            <td>Formación</td>
                            <td>0</td>
                            </tr>
                            <tr>
                            <td>Area rural</td>
                            <td>0</td>
                            </tr>
                            <tr>
                            <th>DATOS EXIF</th>
                            <th>VALOR</th>
                            </tr>
                            <tr>
                            <td>Marca</td>
                            <td>${data.exif.Make ? data.exif.Make : ''}</td>
                            </tr>
                            <tr>
                            <td>Modelo</td>
                            <td>${data.exif.Model ? data.exif.Model : ''}</td>
                            </tr>
                            <tr>
                            <td>Orientación</td>
                            <td>${data.exif.Orientation ? data.exif.Orientation : ''}</td>
                            </tr>
                            <tr>
                            <td>Resolución X</td>
                            <td>${data.exif.XResolution ? data.exif.XResolution : ''}</td>
                            </tr>
                            <tr>
                            <td>Resolución Y</td>
                            <td>${data.exif.YResolution ? data.exif.YResolution : ''}</td>
                            </tr>
                            <tr>
                            <td>Unidad de resolución</td>
                            <td>${data.exif.ResolutionUnit ? data.exif.ResolutionUnit : ''}</td>
                            </tr>
                            <tr>
                            <td>Software</td>
                            <td>${data.exif.Software ? data.exif.Software : ''}</td>
                            </tr>
                            <tr>
                            <td>Fecha y hora</td>
                            <td>${data.exif.datetime ? data.exif.datetime : ''}</td>
                            </tr>
                            <tr>
                            <td>YCbCrPositioning</td>
                            <td>${data.exif.YCbCrPositioning ? data.exif.YCbCrPositioning : ''}</td>
                            </tr>
                            <tr>
                            <td>ExifIFDPointer</td>
                            <td>${data.exif.Exif_IFD_Pointer ? data.exif.Exif_IFD_Pointer : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSInfoIFDPointer</td>
                            <td>${data.exif.GPS_IFD_Pointer ? data.exif.GPS_IFD_Pointer : ''}</td>
                            </tr>
                            <tr>
                            <td>ExposureTime</td>
                            <td>${data.exif.ExposureTime ? data.exif.ExposureTime : ''}</td>
                            </tr>
                            <tr>
                            <td>FNumber</td>
                            <td>${data.exif.FNumber ? data.exif.FNumber : ''}</td>
                            </tr>
                            <tr>
                            <td>ExposureProgram</td>
                            <td>${data.exif.ExposureProgram ? data.exif.ExposureProgram : ''}</td>
                            </tr>
                            <tr>
                            <td>ISOSpeedRatings</td>
                            <td>${data.exif.ISOSpeedRatings ? data.exif.ISOSpeedRatings : ''}</td>
                            </tr>
                            <tr>
                            <td>ExifVersion</td>
                            <td>${data.exif.ExifVersion ? data.exif.ExifVersion : ''}</td>
                            </tr>
                            <tr>
                            <td>DateTimeOriginal</td>
                            <td>${data.exif.DateTimeOriginal ? data.exif.DateTimeOriginal : ''}</td>
                            </tr>
                            <tr>
                            <td>DateTimeDigitized</td>
                            <td>${data.exif.DateTimeDigitized ? data.exif.DateTimeDigitized : ''}</td>
                            </tr>
                            <tr>
                            <td>ComponentsConfiguration</td>
                            <td>${data.exif.ComponentsConfiguration ? data.exif.ComponentsConfiguration : ''}</td>
                            </tr>
                            <tr>
                            <td>ShutterSpeedValue</td>
                            <td>${data.exif.ShutterSpeedValue ? data.exif.ShutterSpeedValue : ''}</td>
                            </tr>
                            <tr>
                            <td>ApertureValue</td>
                            <td>${data.exif.ApertureValue ? data.exif.ApertureValue : ''}</td>
                            </tr>
                            <tr>
                            <td>BrightnessValue</td>
                            <td>${data.exif.BrightnessValue ? data.exif.BrightnessValue : ''}</td>
                            </tr>
                            <tr>
                            <td>ExposureBias</td>
                            <td>${data.exif.ExposureBiasValue ? data.exif.ExposureBiasValue : ''}</td>
                            </tr>
                            <tr>
                            <td>MeteringMode</td>
                            <td>${data.exif.MeteringMode ? data.exif.MeteringMode : ''}</td>
                            </tr>
                            <tr>
                            <td>Flash</td>
                            <td>${data.exif.Flash ? data.exif.Flash : ''}</td>
                            </tr>
                            <tr>
                            <td>FocalLength</td>
                            <td>${data.exif.FocalLength ? data.exif.FocalLength : ''}</td>
                            </tr>
                            <tr>
                            <td>SubjectArea</td>
                            <td>${data.exif.SubjectArea ? data.exif.SubjectArea : ''}</td>
                            </tr>
                            <tr>
                            <td>SubsecTimeOriginal</td>
                            <td>${data.exif.SubSecTimeOriginal ? data.exif.SubSecTimeOriginal : ''}</td>
                            </tr>
                            <tr>
                            <td>SubsecTimeDigitized</td>
                            <td>${data.exif.SubsecTimeDigitized ? data.exif.SubsecTimeDigitized : ''}</td>
                            </tr>
                            <tr>
                            <td>FlashpixVersion</td>
                            <td>${data.exif.FlashPixVersion ? data.exif.FlashPixVersion : ''}</td>
                            </tr>
                            <tr>
                            <td>ColorSpace</td>
                            <td>${data.exif.ColorSpace ? data.exif.ColorSpace : ''}</td>
                            <tr>
                            <td>PixelXDimension</td>
                            <td>${data.exif.PixelXDimension ? data.exif.PixelXDimension : ''}</td>
                            </tr>
                            <tr>
                            <td>PixelYDimension</td>
                            <td>${data.exif.PixelYDimension ? data.exif.PixelYDimension : ''}</td>
                            </tr>
                            <tr>
                            <td>SensingMethod</td>
                            <td>${data.exif.SensingMethod ? data.exif.SensingMethod : ''}</td>
                            </tr>
                            <tr>
                            <td>SceneType</td>
                            <td>${data.exif.SceneType ? data.exif.SceneType : ''}</td>
                            </tr>
                            <tr>
                            <td>CustomRendered</td>
                            <td>${data.exif.CustomRendered ? data.exif.CustomRendered : ''}</td>
                            </tr>
                            <tr>
                            <td>ExposureMode</td>
                            <td>${data.exif.ExposureMode ? data.exif.ExposureMode : ''}</td>
                            </tr>
                            <tr>
                            <td>WhiteBalance</td>
                            <td>${data.exif.WhiteBalance ? data.exif.WhiteBalance : ''}</td>
                            </tr>
                            <tr>
                            <td>FocalLengthIn35mmFilm</td>
                            <td>${data.exif.FocalLengthIn35mmFilm ? data.exif.FocalLengthIn35mmFilm : ''}</td>
                            </tr>
                            <tr>
                            <td>SceneCaptureType</td>
                            <td>${data.exif.SceneCaptureType ? data.exif.SceneCaptureType : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSLatitudeRef</td>
                            <td>${data.exif.GPSLatitudeRef ? data.exif.GPSLatitudeRef : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSLatitude</td>
                            <td>${data.exif && data.exif.GPSLatitude ? `${data.exif.GPSLatitude[0]}, ${data.exif.GPSLatitude[1]}, ${data.exif.GPSLatitude[2]}` : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSLongitudeRef</td>
                            <td>${data.exif.GPSLongitudeRef ? data.exif.GPSLongitudeRef : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSLongitude</td>
                            <td>${data.exif && data.exif.GPSLongitude ? `${data.exif.GPSLongitude[0]}, ${data.exif.GPSLongitude[1]}, ${data.exif.GPSLongitude[2]}` : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSAltitudeRef</td>
                            <td>${data.exif.GPSAltitudeRef ? data.exif.GPSAltitudeRef : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSAltitude</td>
                            <td>${data.exif.GPSAltitude ? data.exif.GPSAltitude : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSSpeedRef</td>
                            <td>${data.exif.GPSSpeedRef ? data.exif.GPSSpeedRef : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSSpeed</td>
                            <td>${data.exif.GPSSpeed ? data.exif.GPSSpeed : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSImgDirectionRef</td>
                            <td>${data.exif.GPSImgDirectionRef ? data.exif.GPSImgDirectionRef : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSImgDirection</td>
                            <td>${data.exif.GPSImgDirection ? data.exif.GPSImgDirection : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSDestBearingRef</td>
                            <td>${data.exif.GPSDestBearingRef ? data.exif.GPSDestBearingRef : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSDestBearing</td>
                            <td>${data.exif.GPSDestBearing ? data.exif.GPSDestBearing : ''}</td>
                            </tr>
                            <tr>
                            <td>GPSDateStamp</td>
                            <td>${data.exif.GPSDateStamp ? data.exif.GPSDateStamp : ''}</td>
                            </tr>
                        </table>`;

                        elementTablePadre.insertBefore(elementTable, elementTablePadre.firstChild);
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
                        document.getElementById('mapBoxAction').querySelector('h2').style.display = 'block';

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

                    //creamos la tabla con los metadatos
                    const elementTable = document.createElement('table');
                    const elementTablePadre = document.getElementById('tableData')
                    elementTable.innerHTML = `<table>
                        <tr>
                        <th>DIRECCIÓN IP</th>
                        <th></th>
                        </tr>
                        <tr>
                        <td>DIRECCIÓN IP</td>
                        <td>We will save your IP Address upon upload</td>
                        </tr>
                        <tr>
                        <th>IMAGEN</th>
                        <th></th>
                        </tr>
                        <tr>
                        <td>IMAGEN</td>
                        <td>Guardamos la imagen con un ancho de 800 píxeles y eliminamos los metadatos</td>
                        </tr>
                        <tr>
                        <td>Identificador único</td>
                        <td>${data.image.uid}</td>
                        </tr>
                        <tr>
                        <td>Latitud</td>
                        <td>${data.image.latitude}</td>
                        </tr>
                        <tr>
                        <td>Longitud</td>
                        <td>${data.image.longuitud}</td>
                        </tr>
                        <tr>
                        <td>Localización manual</td>
                        <td>${data.image.manual}</td>
                        </tr>
                        <tr>
                        <td>Localización correcta</td>
                        <td>${data.image.corrected}</td>
                        </tr>
                        <tr>
                        <td>Date/Time</td>
                        <td>${data.image.datetime}</td>
                        </tr>
                        <tr>
                        <th>ANOTACIONES</th>
                        <th>PUNTAJE</th>
                        </tr>
                        <tr>
                        <td>Planta</td>
                        <td>${data.labels[3].score ? data.labels[3].score : ''}</td>
                        </tr>
                        <tr>
                        <td>Cielo</td>
                        <td>${data.labels[1].score ? data.labels[1].score : ''}</td>
                        </tr>
                        <tr>
                        <td>Madera</td>
                        <td>0</td>
                        </tr>
                        <tr>
                        <td>Base</td>
                        <td>0</td>
                        </tr>
                        <tr>
                        <td>Muro</td>
                        <td>0</td>
                        </tr>
                        <tr>
                        <td>Nube</td>
                        <td>${data.labels[0].score ? data.labels[0].score : ''}</td>
                        </tr>
                        <tr>
                        <td>Pared de piedra</td>
                        <td>0</td>
                        </tr>
                        <tr>
                        <td>Paisaje</td>
                        <td>${data.labels[8].score ? data.labels[8].score : ''}</td>
                        </tr>
                        <tr>
                        <td>Formación</td>
                        <td>0</td>
                        </tr>
                        <tr>
                        <td>Area rural</td>
                        <td>0</td>
                        </tr>
                        <tr>
                        <th>DATOS EXIF</th>
                        <th>VALOR</th>
                        </tr>
                        <tr>
                        <td>Marca</td>
                        <td>${data.exif.Make ? data.exif.Make : ''}</td>
                        </tr>
                        <tr>
                        <td>Modelo</td>
                        <td>${data.exif.Model ? data.exif.Model : ''}</td>
                        </tr>
                        <tr>
                        <td>Orientación</td>
                        <td>${data.exif.Orientation ? data.exif.Orientation : ''}</td>
                        </tr>
                        <tr>
                        <td>Resolución X</td>
                        <td>${data.exif.XResolution ? data.exif.XResolution : ''}</td>
                        </tr>
                        <tr>
                        <td>Resolución Y</td>
                        <td>${data.exif.YResolution ? data.exif.YResolution : ''}</td>
                        </tr>
                        <tr>
                        <td>Unidad de resolución</td>
                        <td>${data.exif.ResolutionUnit ? data.exif.ResolutionUnit : ''}</td>
                        </tr>
                        <tr>
                        <td>Software</td>
                        <td>${data.exif.Software ? data.exif.Software : ''}</td>
                        </tr>
                        <tr>
                        <td>Fecha y hora</td>
                        <td>${data.exif.datetime ? data.exif.datetime : ''}</td>
                        </tr>
                        <tr>
                        <td>YCbCrPositioning</td>
                        <td>${data.exif.YCbCrPositioning ? data.exif.YCbCrPositioning : ''}</td>
                        </tr>
                        <tr>
                        <td>ExifIFDPointer</td>
                        <td>${data.exif.Exif_IFD_Pointer ? data.exif.Exif_IFD_Pointer : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSInfoIFDPointer</td>
                        <td>${data.exif.GPS_IFD_Pointer ? data.exif.GPS_IFD_Pointer : ''}</td>
                        </tr>
                        <tr>
                        <td>ExposureTime</td>
                        <td>${data.exif.ExposureTime ? data.exif.ExposureTime : ''}</td>
                        </tr>
                        <tr>
                        <td>FNumber</td>
                        <td>${data.exif.FNumber ? data.exif.FNumber : ''}</td>
                        </tr>
                        <tr>
                        <td>ExposureProgram</td>
                        <td>${data.exif.ExposureProgram ? data.exif.ExposureProgram : ''}</td>
                        </tr>
                        <tr>
                        <td>ISOSpeedRatings</td>
                        <td>${data.exif.ISOSpeedRatings ? data.exif.ISOSpeedRatings : ''}</td>
                        </tr>
                        <tr>
                        <td>ExifVersion</td>
                        <td>${data.exif.ExifVersion ? data.exif.ExifVersion : ''}</td>
                        </tr>
                        <tr>
                        <td>DateTimeOriginal</td>
                        <td>${data.exif.DateTimeOriginal ? data.exif.DateTimeOriginal : ''}</td>
                        </tr>
                        <tr>
                        <td>DateTimeDigitized</td>
                        <td>${data.exif.DateTimeDigitized ? data.exif.DateTimeDigitized : ''}</td>
                        </tr>
                        <tr>
                        <td>ComponentsConfiguration</td>
                        <td>${data.exif.ComponentsConfiguration ? data.exif.ComponentsConfiguration : ''}</td>
                        </tr>
                        <tr>
                        <td>ShutterSpeedValue</td>
                        <td>${data.exif.ShutterSpeedValue ? data.exif.ShutterSpeedValue : ''}</td>
                        </tr>
                        <tr>
                        <td>ApertureValue</td>
                        <td>${data.exif.ApertureValue ? data.exif.ApertureValue : ''}</td>
                        </tr>
                        <tr>
                        <td>BrightnessValue</td>
                        <td>${data.exif.BrightnessValue ? data.exif.BrightnessValue : ''}</td>
                        </tr>
                        <tr>
                        <td>ExposureBias</td>
                        <td>${data.exif.ExposureBiasValue ? data.exif.ExposureBiasValue : ''}</td>
                        </tr>
                        <tr>
                        <td>MeteringMode</td>
                        <td>${data.exif.MeteringMode ? data.exif.MeteringMode : ''}</td>
                        </tr>
                        <tr>
                        <td>Flash</td>
                        <td>${data.exif.Flash ? data.exif.Flash : ''}</td>
                        </tr>
                        <tr>
                        <td>FocalLength</td>
                        <td>${data.exif.FocalLength ? data.exif.FocalLength : ''}</td>
                        </tr>
                        <tr>
                        <td>SubjectArea</td>
                        <td>${data.exif.SubjectArea ? data.exif.SubjectArea : ''}</td>
                        </tr>
                        <tr>
                        <td>SubsecTimeOriginal</td>
                        <td>${data.exif.SubSecTimeOriginal ? data.exif.SubSecTimeOriginal : ''}</td>
                        </tr>
                        <tr>
                        <td>SubsecTimeDigitized</td>
                        <td>${data.exif.SubsecTimeDigitized ? data.exif.SubsecTimeDigitized : ''}</td>
                        </tr>
                        <tr>
                        <td>FlashpixVersion</td>
                        <td>${data.exif.FlashPixVersion ? data.exif.FlashPixVersion : ''}</td>
                        </tr>
                        <tr>
                        <td>ColorSpace</td>
                        <td>${data.exif.ColorSpace ? data.exif.ColorSpace : ''}</td>
                        <tr>
                        <td>PixelXDimension</td>
                        <td>${data.exif.PixelXDimension ? data.exif.PixelXDimension : ''}</td>
                        </tr>
                        <tr>
                        <td>PixelYDimension</td>
                        <td>${data.exif.PixelYDimension ? data.exif.PixelYDimension : ''}</td>
                        </tr>
                        <tr>
                        <td>SensingMethod</td>
                        <td>${data.exif.SensingMethod ? data.exif.SensingMethod : ''}</td>
                        </tr>
                        <tr>
                        <td>SceneType</td>
                        <td>${data.exif.SceneType ? data.exif.SceneType : ''}</td>
                        </tr>
                        <tr>
                        <td>CustomRendered</td>
                        <td>${data.exif.CustomRendered ? data.exif.CustomRendered : ''}</td>
                        </tr>
                        <tr>
                        <td>ExposureMode</td>
                        <td>${data.exif.ExposureMode ? data.exif.ExposureMode : ''}</td>
                        </tr>
                        <tr>
                        <td>WhiteBalance</td>
                        <td>${data.exif.WhiteBalance ? data.exif.WhiteBalance : ''}</td>
                        </tr>
                        <tr>
                        <td>FocalLengthIn35mmFilm</td>
                        <td>${data.exif.FocalLengthIn35mmFilm ? data.exif.FocalLengthIn35mmFilm : ''}</td>
                        </tr>
                        <tr>
                        <td>SceneCaptureType</td>
                        <td>${data.exif.SceneCaptureType ? data.exif.SceneCaptureType : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSLatitudeRef</td>
                        <td>${data.exif.GPSLatitudeRef ? data.exif.GPSLatitudeRef : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSLatitude</td>
                        <td>${data.exif && data.exif.GPSLatitude ? `${data.exif.GPSLatitude[0]}, ${data.exif.GPSLatitude[1]}, ${data.exif.GPSLatitude[2]}` : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSLongitudeRef</td>
                        <td>${data.exif.GPSLongitudeRef ? data.exif.GPSLongitudeRef : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSLongitude</td>
                        <td>${data.exif && data.exif.GPSLongitude ? `${data.exif.GPSLongitude[0]}, ${data.exif.GPSLongitude[1]}, ${data.exif.GPSLongitude[2]}` : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSAltitudeRef</td>
                        <td>${data.exif.GPSAltitudeRef ? data.exif.GPSAltitudeRef : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSAltitude</td>
                        <td>${data.exif.GPSAltitude ? data.exif.GPSAltitude : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSSpeedRef</td>
                        <td>${data.exif.GPSSpeedRef ? data.exif.GPSSpeedRef : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSSpeed</td>
                        <td>${data.exif.GPSSpeed ? data.exif.GPSSpeed : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSImgDirectionRef</td>
                        <td>${data.exif.GPSImgDirectionRef ? data.exif.GPSImgDirectionRef : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSImgDirection</td>
                        <td>${data.exif.GPSImgDirection ? data.exif.GPSImgDirection : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSDestBearingRef</td>
                        <td>${data.exif.GPSDestBearingRef ? data.exif.GPSDestBearingRef : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSDestBearing</td>
                        <td>${data.exif.GPSDestBearing ? data.exif.GPSDestBearing : ''}</td>
                        </tr>
                        <tr>
                        <td>GPSDateStamp</td>
                        <td>${data.exif.GPSDateStamp ? data.exif.GPSDateStamp : ''}</td>
                        </tr>
                    </table>`;

                    elementTablePadre.insertBefore(elementTable, elementTablePadre.firstChild);


                });

            });
            

        } else { 

            const errorObj = await response.json();

            document.getElementById('mapBoxAction').querySelector('h1').style.display = 'none';
            document.getElementById('mapBoxAction').querySelector('h2').style.display = 'none';

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
                                document.getElementById('mapBoxAction').querySelector('h2').style.display = 'block';

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

                                fetch('https://stagingback.guardacostascorona.com/api/contribute', {
                                    method: 'POST',
                                    body: formData
                                })
                                .then((response) => response.json())
                                .then((data) => {

                                    console.log(data);

                                    //creamos la tabla con los metadatos
                                    const elementTable = document.createElement('table');
                                    const elementTablePadre = document.getElementById('tableData')
                                    elementTable.innerHTML = `<table>
                                        <tr>
                                        <th>DIRECCIÓN IP</th>
                                        <th></th>
                                        </tr>
                                        <tr>
                                        <td>DIRECCIÓN IP</td>
                                        <td>We will save your IP Address upon upload</td>
                                        </tr>
                                        <tr>
                                        <th>IMAGEN</th>
                                        <th></th>
                                        </tr>
                                        <tr>
                                        <td>IMAGEN</td>
                                        <td>Guardamos la imagen con un ancho de 800 píxeles y eliminamos los metadatos</td>
                                        </tr>
                                        <tr>
                                        <td>Identificador único</td>
                                        <td>${data.image.uid}</td>
                                        </tr>
                                        <tr>
                                        <td>Latitud</td>
                                        <td>${data.image.latitude}</td>
                                        </tr>
                                        <tr>
                                        <td>Longitud</td>
                                        <td>${data.image.longuitud}</td>
                                        </tr>
                                        <tr>
                                        <td>Localización manual</td>
                                        <td>${data.image.manual}</td>
                                        </tr>
                                        <tr>
                                        <td>Localización correcta</td>
                                        <td>${data.image.corrected}</td>
                                        </tr>
                                        <tr>
                                        <td>Date/Time</td>
                                        <td>${data.image.datetime}</td>
                                        </tr>
                                        <tr>
                                        <th>ANOTACIONES</th>
                                        <th>PUNTAJE</th>
                                        </tr>
                                        <tr>
                                        <td>Planta</td>
                                        <td>${data.labels[3].score ? data.labels[3].score : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Cielo</td>
                                        <td>${data.labels[1].score ? data.labels[1].score : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Madera</td>
                                        <td>0</td>
                                        </tr>
                                        <tr>
                                        <td>Base</td>
                                        <td>0</td>
                                        </tr>
                                        <tr>
                                        <td>Muro</td>
                                        <td>0</td>
                                        </tr>
                                        <tr>
                                        <td>Nube</td>
                                        <td>${data.labels[0].score ? data.labels[0].score : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Pared de piedra</td>
                                        <td>0</td>
                                        </tr>
                                        <tr>
                                        <td>Paisaje</td>
                                        <td>${data.labels[8].score ? data.labels[8].score : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Formación</td>
                                        <td>0</td>
                                        </tr>
                                        <tr>
                                        <td>Area rural</td>
                                        <td>0</td>
                                        </tr>
                                        <tr>
                                        <th>DATOS EXIF</th>
                                        <th>VALOR</th>
                                        </tr>
                                        <tr>
                                        <td>Marca</td>
                                        <td>${data.exif.Make ? data.exif.Make : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Modelo</td>
                                        <td>${data.exif.Model ? data.exif.Model : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Orientación</td>
                                        <td>${data.exif.Orientation ? data.exif.Orientation : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Resolución X</td>
                                        <td>${data.exif.XResolution ? data.exif.XResolution : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Resolución Y</td>
                                        <td>${data.exif.YResolution ? data.exif.YResolution : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Unidad de resolución</td>
                                        <td>${data.exif.ResolutionUnit ? data.exif.ResolutionUnit : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Software</td>
                                        <td>${data.exif.Software ? data.exif.Software : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Fecha y hora</td>
                                        <td>${data.exif.datetime ? data.exif.datetime : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>YCbCrPositioning</td>
                                        <td>${data.exif.YCbCrPositioning ? data.exif.YCbCrPositioning : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ExifIFDPointer</td>
                                        <td>${data.exif.Exif_IFD_Pointer ? data.exif.Exif_IFD_Pointer : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSInfoIFDPointer</td>
                                        <td>${data.exif.GPS_IFD_Pointer ? data.exif.GPS_IFD_Pointer : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ExposureTime</td>
                                        <td>${data.exif.ExposureTime ? data.exif.ExposureTime : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>FNumber</td>
                                        <td>${data.exif.FNumber ? data.exif.FNumber : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ExposureProgram</td>
                                        <td>${data.exif.ExposureProgram ? data.exif.ExposureProgram : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ISOSpeedRatings</td>
                                        <td>${data.exif.ISOSpeedRatings ? data.exif.ISOSpeedRatings : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ExifVersion</td>
                                        <td>${data.exif.ExifVersion ? data.exif.ExifVersion : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>DateTimeOriginal</td>
                                        <td>${data.exif.DateTimeOriginal ? data.exif.DateTimeOriginal : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>DateTimeDigitized</td>
                                        <td>${data.exif.DateTimeDigitized ? data.exif.DateTimeDigitized : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ComponentsConfiguration</td>
                                        <td>${data.exif.ComponentsConfiguration ? data.exif.ComponentsConfiguration : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ShutterSpeedValue</td>
                                        <td>${data.exif.ShutterSpeedValue ? data.exif.ShutterSpeedValue : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ApertureValue</td>
                                        <td>${data.exif.ApertureValue ? data.exif.ApertureValue : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>BrightnessValue</td>
                                        <td>${data.exif.BrightnessValue ? data.exif.BrightnessValue : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ExposureBias</td>
                                        <td>${data.exif.ExposureBiasValue ? data.exif.ExposureBiasValue : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>MeteringMode</td>
                                        <td>${data.exif.MeteringMode ? data.exif.MeteringMode : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>Flash</td>
                                        <td>${data.exif.Flash ? data.exif.Flash : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>FocalLength</td>
                                        <td>${data.exif.FocalLength ? data.exif.FocalLength : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>SubjectArea</td>
                                        <td>${data.exif.SubjectArea ? data.exif.SubjectArea : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>SubsecTimeOriginal</td>
                                        <td>${data.exif.SubSecTimeOriginal ? data.exif.SubSecTimeOriginal : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>SubsecTimeDigitized</td>
                                        <td>${data.exif.SubsecTimeDigitized ? data.exif.SubsecTimeDigitized : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>FlashpixVersion</td>
                                        <td>${data.exif.FlashPixVersion ? data.exif.FlashPixVersion : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ColorSpace</td>
                                        <td>${data.exif.ColorSpace ? data.exif.ColorSpace : ''}</td>
                                        <tr>
                                        <td>PixelXDimension</td>
                                        <td>${data.exif.PixelXDimension ? data.exif.PixelXDimension : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>PixelYDimension</td>
                                        <td>${data.exif.PixelYDimension ? data.exif.PixelYDimension : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>SensingMethod</td>
                                        <td>${data.exif.SensingMethod ? data.exif.SensingMethod : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>SceneType</td>
                                        <td>${data.exif.SceneType ? data.exif.SceneType : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>CustomRendered</td>
                                        <td>${data.exif.CustomRendered ? data.exif.CustomRendered : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>ExposureMode</td>
                                        <td>${data.exif.ExposureMode ? data.exif.ExposureMode : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>WhiteBalance</td>
                                        <td>${data.exif.WhiteBalance ? data.exif.WhiteBalance : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>FocalLengthIn35mmFilm</td>
                                        <td>${data.exif.FocalLengthIn35mmFilm ? data.exif.FocalLengthIn35mmFilm : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>SceneCaptureType</td>
                                        <td>${data.exif.SceneCaptureType ? data.exif.SceneCaptureType : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSLatitudeRef</td>
                                        <td>${data.exif.GPSLatitudeRef ? data.exif.GPSLatitudeRef : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSLatitude</td>
                                        <td>${data.exif && data.exif.GPSLatitude ? `${data.exif.GPSLatitude[0]}, ${data.exif.GPSLatitude[1]}, ${data.exif.GPSLatitude[2]}` : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSLongitudeRef</td>
                                        <td>${data.exif.GPSLongitudeRef ? data.exif.GPSLongitudeRef : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSLongitude</td>
                                        <td>${data.exif && data.exif.GPSLongitude ? `${data.exif.GPSLongitude[0]}, ${data.exif.GPSLongitude[1]}, ${data.exif.GPSLongitude[2]}` : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSAltitudeRef</td>
                                        <td>${data.exif.GPSAltitudeRef ? data.exif.GPSAltitudeRef : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSAltitude</td>
                                        <td>${data.exif.GPSAltitude ? data.exif.GPSAltitude : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSSpeedRef</td>
                                        <td>${data.exif.GPSSpeedRef ? data.exif.GPSSpeedRef : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSSpeed</td>
                                        <td>${data.exif.GPSSpeed ? data.exif.GPSSpeed : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSImgDirectionRef</td>
                                        <td>${data.exif.GPSImgDirectionRef ? data.exif.GPSImgDirectionRef : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSImgDirection</td>
                                        <td>${data.exif.GPSImgDirection ? data.exif.GPSImgDirection : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSDestBearingRef</td>
                                        <td>${data.exif.GPSDestBearingRef ? data.exif.GPSDestBearingRef : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSDestBearing</td>
                                        <td>${data.exif.GPSDestBearing ? data.exif.GPSDestBearing : ''}</td>
                                        </tr>
                                        <tr>
                                        <td>GPSDateStamp</td>
                                        <td>${data.exif.GPSDateStamp ? data.exif.GPSDateStamp : ''}</td>
                                        </tr>
                                    </table>`;

                                    elementTablePadre.insertBefore(elementTable, elementTablePadre.firstChild);

                                    formDraggable(data.id, marker, file);
                                });

                            }

                            setSearchMap.addEventListener('click', handleClick);
            
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
