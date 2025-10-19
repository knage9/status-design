// Interactive Soundproofing Zones functionality (for shum.html page)
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the shum.html page
    if (document.querySelector('.soundproofing-zones')) {
        const zonesMainImage = document.getElementById('zonesMainImage');
        const zoneButtons = document.querySelectorAll('.zone-btn');

        let currentImage = 'img/shum-preview.png';

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

        // Function to reset to default image
        function resetToDefaultImage() {
            if (zonesMainImage && currentImage !== 'img/shum-preview.png') {
                changeMainImage('img/shum-preview.png');
            }
        }

        // Add event listeners to zone buttons
        zoneButtons.forEach(button => {
            const zoneImage = button.getAttribute('data-image');

            if (zoneImage) {
                // Click event - change image and toggle active state
                button.addEventListener('click', function() {
                    const isActive = this.classList.contains('active');

                    // Remove active class from all buttons
                    zoneButtons.forEach(btn => btn.classList.remove('active'));

                    if (!isActive) {
                        // Activate clicked button and change image
                        this.classList.add('active');
                        changeMainImage(zoneImage);
                    } else {
                        // If clicking active button, deactivate it and reset image
                        resetToDefaultImage();
                    }
                });
            }
        });

        // Initialize with default image
        if (zonesMainImage) {
            zonesMainImage.src = currentImage;
        }
    }
});
