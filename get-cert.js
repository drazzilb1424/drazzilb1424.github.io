jQuery(function ($) {
    const qs = new URLSearchParams(window.location.search);
    const certNumber = qs.get('cert'); // fallback for testing
    // const certNumber = '94382719'; // Change to dynamic input if needed

    const buildCertCard = (cert, pop, images) => {
        const statGrid = $('<div class="cert-stat-grid"></div>').css({
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            padding: '10px'
        });

        statGrid.append(`<div><small>ITEM GRADE</small><h3>${cert.GradeDescription}</h3></div>`);
        statGrid.append(`<div><small>PSA POPULATION</small><h3>${pop.TotalPopulation}</h3></div>`);
        statGrid.append(`<div><small>PSA POP HIGHER</small><h3>${pop.PopulationHigher}</h3></div>`);

        const statWrapper = $('<div class="cert-stat-wrapper"></div>').css({
            display: 'flex',
            justifyContent: 'center'
        }).append(statGrid);

        const card = $('<div class="psa-cert-card"></div>');

        card.append(`<h2 style="margin-top: 0; text-align: center; color: black; padding-top: 10px">PSA Cert #${cert.CertNumber}</h3>`);
        card.append(`<h3 style="margin-top: 0; text-align: center; color: black; padding-top: 10px">${cert.Year} ${cert.SetName}#${cert.CardNumber}<br>${cert.Subject} ${cert.Variety}</h3>`);

        if (images.length > 0) {
            const imageRow = $('<div class="psa-image-row"></div>').css({
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                marginBottom: '20px'
            });

            const imageWrapper = $('<div class="image-section"></div>').css({
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                color: 'black'
            });
            imageRow.append(imageWrapper);

            images.forEach(image => {
                const isFront = !!(image.IsFrontImage || image.ImageType === 'Front');
                const label = isFront ? 'Front' : 'Back';
                const imgUrl = (image.ImageURL || image.ImageUrl || '').replace(/^http:\/\//, 'https://');

                const img = $(`<img src="${imgUrl}" alt="${label}" />`).css({
                    maxWidth: '100%',
                    width: '350px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '5px'
                });

                const wrapper = $('<div></div>').css({ textAlign: 'center' });

                // Label as clickable link directly below the image
                const labelLink = $(`<div><a href="${imgUrl}" target="_blank" rel="noopener noreferrer">${label}</a></div>`);

                wrapper.append(img).append(labelLink);
                imageWrapper.append(wrapper);
            });

            card.append(imageRow);
        } else {
            card.append(
                $('<div>No images found</div>').css({
                    color: 'red',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'center'
                })
            );
        }

        card.append(statWrapper);

        const detailText = `
                <p><strong>Year:</strong> ${cert.Year}</p>
                <p><strong>Set:</strong> ${cert.SetName}</p>
                <p><strong>Card Name:</strong> ${cert.Subject}</p>
                <p><strong>Card #:</strong> ${cert.CardNumber}</p>
                <p><strong>Variety:</strong> ${cert.Variety}</p>
                <p><strong>Grade:</strong> ${cert.GradeDescription}</p>
            `;

        const detailWrapper = $('<div class="cert-details"></div>').css({
            textAlign: 'left',
            color: 'black'
        }).html(detailText);

        const outerWrapper = $('<div class="cert-details-wrapper"></div>').css({
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px'
        });

        outerWrapper.append(detailWrapper);
        card.append(outerWrapper);

        return card;
    };

    const fetchCertData = (certNum) => {
        return $.ajax({
            url: `https://api.psacard.com/publicapi/cert/GetByCertNumberForFileAppend/${certNum}`,
            method: 'GET',
            headers: {
                'Authorization': 'bearer 1oPf1WwogPfhdzo_7EoDW3g9SzvlaCEQXxnius6vjZsI7Vown7wJ2glbRb_7yHI75W4M0L-wE0eRw1yr74ZHnh5E5CCLt90-O1jBjLugLhOYLIPeBt0illfQsmDjpgfmjD-vxYQrKEW25KpUm4scl0Ld6I_3mtO1RLOqaExR_K6EVHeoUUNf2JnbkpGjVGzHuAMoqGgU9QnzZ7buJA693jalrwZTTnTPqbgaNxFFEFo5X77rauk-JnK78LDYexMHA9e4oekDODLJUzAmii5xSuWY1rsI-dMARgFZSCZG-XX48Bo7'
            }
        });
    };

    const fetchCardImages = (certNum) => {
        return $.ajax({
            url: `https://api.psacard.com/publicapi/cert/GetImagesByCertNumber/${certNum}`,
            method: 'GET',
            headers: {
                'Authorization': 'bearer 1oPf1WwogPfhdzo_7EoDW3g9SzvlaCEQXxnius6vjZsI7Vown7wJ2glbRb_7yHI75W4M0L-wE0eRw1yr74ZHnh5E5CCLt90-O1jBjLugLhOYLIPeBt0illfQsmDjpgfmjD-vxYQrKEW25KpUm4scl0Ld6I_3mtO1RLOqaExR_K6EVHeoUUNf2JnbkpGjVGzHuAMoqGgU9QnzZ7buJA693jalrwZTTnTPqbgaNxFFEFo5X77rauk-JnK78LDYexMHA9e4oekDODLJUzAmii5xSuWY1rsI-dMARgFZSCZG-XX48Bo7'
            }
        });
    };

    $('#loader').show();

    $.when(fetchCertData(certNumber), fetchCardImages(certNumber)).done(function (certRes, imageRes) {
        $('#loader').hide();

        const cert = certRes[0].PSACert;
        const pop = certRes[0].PSAPopulation;

        // images from API
        const imgs = imageRes[0] || [];

        // normalize and order: Front first, then Back
        const images = imgs.slice().sort((a, b) => {
            const aFront = !!(a.IsFrontImage || a.ImageType === 'Front');
            const bFront = !!(b.IsFrontImage || b.ImageType === 'Front');
            if (aFront === bFront) return 0;
            return aFront ? -1 : 1; // front before back
        });

        const certCard = buildCertCard(cert, pop, images);
        $('#psa-cert-container').empty().append(certCard);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        $('#loader').hide();
        console.error("❌ Error fetching data:", textStatus, errorThrown);
        $('#psa-cert-container').html('<p style="color: red; text-align: center;">Failed to load PSA cert data.</p>');
    });
});