export const reportImage = (id) => {

    const statusMessage = document.getElementById('messageReport');
    const url = 'https://stagingback.guardacostascorona.com/api/contribute/report/'+ id;
    const sendReport = document.getElementById('sendReport');
    const email = document.getElementById('mapReportImageMail');
    const comment = document.getElementById('mapReportImage');
    const emailRegex = /\S+@\S+\.\S+/;

    email.addEventListener('input', () => {
        const isValidEmail = emailRegex.test(email.value);
        const isValidComment = comment.value.trim() !== '';

        if (isValidEmail && isValidComment) {
            document.getElementById('sendReport').style.opacity = '1';
            document.getElementById('sendReport').style.pointerEvents = 'initial';
        } else {
            document.getElementById('sendReport').style.opacity = '.5';
            document.getElementById('sendReport').style.pointerEvents = 'none';
        }
    });

    sendReport.addEventListener('click', (e) => {
        e.preventDefault();
        
        statusMessage.textContent = 'Enviando informacion...';

        let data = JSON.stringify({
            'email': email.value,
            'reason': comment.value,
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
            document.getElementById('mapReportImage').value = '';
            document.getElementById('mapReportImageMail').value = '';
            document.getElementById('sendReport').style.opacity = '.5';
            document.getElementById('sendReport').style.pointerEvents = 'none';
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            statusMessage.textContent = '¡Gracias por enviar su información!';
        });
    });
}