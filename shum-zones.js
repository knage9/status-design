// Interactive Soundproofing Zones functionality (for shum.html page)
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the shum.html page
    if (document.querySelector('.soundproofing-zones')) {
        const zonesMainImage = document.getElementById('zonesMainImage');
        const zonesPopup = document.getElementById('zonesPopup');
        const zonesPopupTitle = document.getElementById('zonesPopupTitle');
        const zonesPopupDescription = document.getElementById('zonesPopupDescription');
        const zoneButtons = document.querySelectorAll('.zone-btn');

        let currentImage = 'img/shum-preview.png';
        let popupTimeout;

        // Zone data
        const zonesData = {
            hood: {
                title: 'Капот',
                description: 'Шумоизоляция капота значительно снижает шум от двигателя и дорожные вибрации, создавая более комфортную атмосферу в салоне.',
                image: 'img/капот-шум.png'
            },
            roof: {
                title: 'Крыша',
                description: 'Шумоизоляция крыши эффективно блокирует шум дождя, ветра и внешние звуки, обеспечивая тишину даже в плохую погоду.',
                image: 'img/крыша-шум.png'
            },
            trunk: {
                title: 'Багажник',
                description: 'Обработка багажного отделения устраняет шум от колес и дорожного покрытия, а также улучшает акустику музыки в автомобиле.',
                image: 'img/багажгик-шум.png'
            },
            floor: {
                title: 'Дно',
                description: 'Шумоизоляция пола салона и багажника максимально снижает шум от дорожного покрытия, вибрации и улучшает теплоизоляцию.',
                image: 'img/дно-шум.png'
            },
            doors: {
                title: 'Двери',
                description: 'Комплексная обработка дверей обеспечивает отличную звукоизоляцию от внешнего шума, улучшает качество музыки и снижает вибрации.',
                image: 'img/двери-шум.png'
            },
            arches: {
                title: 'Арки снаружи',
                description: 'Обработка колесных арок снаружи эффективно блокирует шум от шин и дорожного покрытия, значительно повышая комфорт вождения.',
                image: 'img/арки-шум.png'
            }
        };

        // Function to show popup
        function showPopup(zoneData) {
            if (zonesPopupTitle && zonesPopupDescription && zonesPopup) {
                zonesPopupTitle.textContent = zoneData.title;
                zonesPopupDescription.textContent = zoneData.description;
                zonesPopup.classList.add('active');
            }

            // Clear any existing timeout
            if (popupTimeout) {
                clearTimeout(popupTimeout);
            }
        }

        // Function to hide popup
        function hidePopup() {
            if (zonesPopup) {
                zonesPopup.classList.remove('active');
            }
        }

        // Function to change main image
        function changeMainImage(newImage) {
            if (zonesMainImage && newImage !== currentImage) {
                zonesMainImage.style.opacity = '0.8';

                setTimeout(() => {
                    zonesMainImage.src = newImage;
                    zonesMainImage.style.opacity = '1';
                    currentImage = newImage;
                }, 150);
            }
        }

        // Add event listeners to zone buttons
        zoneButtons.forEach(button => {
            const zoneKey = button.getAttribute('data-zone');
            const zoneData = zonesData[zoneKey];

            if (zoneData) {
                // Click event - change image and show popup
                button.addEventListener('click', function() {
                    changeMainImage(zoneData.image);

                    // Remove active class from all buttons
                    zoneButtons.forEach(btn => btn.classList.remove('active'));
                    // Add active class to clicked button
                    this.classList.add('active');

                    showPopup(zoneData);
                });

                // Mouse enter event - show popup
                button.addEventListener('mouseenter', function() {
                    showPopup(zoneData);

                    // Set timeout to hide popup
                    popupTimeout = setTimeout(() => {
                        hidePopup();
                    }, 5000); // Hide after 5 seconds
                });

                // Mouse leave event - hide popup
                button.addEventListener('mouseleave', function() {
                    if (popupTimeout) {
                        clearTimeout(popupTimeout);
                    }
                    hidePopup();
                });
            }
        });

        // Mouse events for image container
        const imageContainer = document.querySelector('.zones-image-container');
        if (imageContainer) {
            imageContainer.addEventListener('mouseenter', function() {
                // Show default popup when hovering over image
                if (zonesPopup && !zonesPopup.classList.contains('active')) {
                    if (zonesPopupTitle && zonesPopupDescription) {
                        zonesPopupTitle.textContent = 'Выберите зону';
                        zonesPopupDescription.textContent = 'Наведите курсор на интересующую зону для получения подробной информации';
                    }
                    zonesPopup.classList.add('active');
                }
            });

            imageContainer.addEventListener('mouseleave', function() {
                // Hide popup if no button is being hovered
                const isHoveringButton = Array.from(zoneButtons).some(btn =>
                    btn.matches(':hover')
                );

                if (!isHoveringButton) {
                    hidePopup();
                }
            });
        }

        // Reset to default image when popup is hidden and no button is active
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    zonesPopup && !zonesPopup.classList.contains('active')) {

                    const activeButton = document.querySelector('.zone-btn.active');
                    if (!activeButton) {
                        // No active button, reset to default image
                        setTimeout(() => {
                            if (!document.querySelector('.zone-btn.active')) {
                                changeMainImage('img/shum-preview.png');
                            }
                        }, 300);
                    }
                }
            });
        });

        if (zonesPopup) {
            observer.observe(zonesPopup, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        // Initialize with default image
        if (zonesMainImage) {
            zonesMainImage.src = currentImage;
        }
    }
});
