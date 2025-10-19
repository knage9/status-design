// Shum Results Gallery Functionality (адаптировано из антихрома)
document.addEventListener('DOMContentLoaded', function() {
    const thumbnails = document.querySelectorAll('.shum-results__thumbnail');
    const mainImage = document.getElementById('mainShumImage');
    const mainTitle = document.getElementById('mainShumTitle');
    const mainServices = document.getElementById('mainShumServices');
    const prevBtn = document.querySelector('.shum-results__nav-btn--prev');
    const nextBtn = document.querySelector('.shum-results__nav-btn--next');

    // Shum projects data (адаптировано для шумоизоляции)
    const projects = [
        {
            id: 0,
            title: 'Mercedes GLC',
            images: [
                'img/Gallery-1.png',
                'img/Gallery-2.png',
                'img/Gallery-3.png'
            ],
            thumbnails: [
                'img/Gallery-1.png',
                'img/Gallery-2.png',
                'img/Gallery-3.png'
            ],
            alt: 'Mercedes GLC - Шумоизоляция с арками',
            services: [
                { badge: '12 часов', text: 'Время на работу' },
                { badge: '2 года', text: 'Гарантия' },
                { badge: '88 000₽', text: 'Стоимость' }
            ]
        },
        {
            id: 1,
            title: 'BMW X5',
            images: [
                'img/Gallery-2.png',
                'img/Gallery-3.png',
                'img/Gallery-1.png'
            ],
            thumbnails: [
                'img/Gallery-2.png',
                'img/Gallery-3.png',
                'img/Gallery-1.png'
            ],
            alt: 'BMW X5 - Полная шумоизоляция',
            services: [
                { badge: '16 часов', text: 'Время на работу' },
                { badge: '3 года', text: 'Гарантия' },
                { badge: '120 000₽', text: 'Стоимость' }
            ]
        },
        {
            id: 2,
            title: 'Audi A6',
            images: [
                'img/Gallery-3.png',
                'img/Gallery-1.png',
                'img/Gallery-2.png'
            ],
            thumbnails: [
                'img/Gallery-3.png',
                'img/Gallery-1.png',
                'img/Gallery-2.png'
            ],
            alt: 'Audi A6 - Премиум шумоизоляция',
            services: [
                { badge: '14 часов', text: 'Время на работу' },
                { badge: '2 года', text: 'Гарантия' },
                { badge: '95 000₽', text: 'Стоимость' }
            ]
        }
    ];

    let currentProjectIndex = 0;
    let currentImageIndex = 0;

    // Generate thumbnails for a project
    function generateThumbnails(project) {
        const thumbnailsContainer = document.getElementById('shumThumbnails');
        thumbnailsContainer.innerHTML = '';

        project.thumbnails.forEach((thumbnailSrc, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'shum-results__thumbnail';
            thumbnail.dataset.image = index;

            const img = document.createElement('img');
            img.src = thumbnailSrc;
            img.alt = `${project.title} - вид ${index + 1}`;

            thumbnail.appendChild(img);
            thumbnailsContainer.appendChild(thumbnail);

            // Add click handler
            thumbnail.addEventListener('click', () => {
                updateImage(index);
            });
        });

        // Update thumbnails variable to include newly created thumbnails
        const newThumbnails = document.querySelectorAll('.shum-results__thumbnail');
        return newThumbnails;
    }

    // Update portfolio display
    function updateProject(projectIndex) {
        const project = projects[projectIndex];

        // Update main content
        mainImage.src = project.images[currentImageIndex];
        mainImage.alt = project.alt;
        mainTitle.textContent = project.title;

        // Update services list
        mainServices.innerHTML = '';
        project.services.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'shum-results__service-item';
            serviceItem.innerHTML = `
                <div class="shum-results__service-badge">${service.badge}</div>
                <div class="shum-results__service-text">${service.text}</div>
            `;
            mainServices.appendChild(serviceItem);
        });

        // Generate and update thumbnails for current project
        const newThumbnails = generateThumbnails(project);

        // Update active thumbnail based on current image
        newThumbnails.forEach((thumb, i) => {
            if (i === currentImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });

        currentProjectIndex = projectIndex;
    }

    // Update current image within project
    function updateImage(imageIndex) {
        currentImageIndex = imageIndex;

        // Update main image
        mainImage.src = projects[currentProjectIndex].images[currentImageIndex];

        // Update active thumbnail - get current thumbnails and update their active state
        const currentThumbnails = document.querySelectorAll('.shum-results__thumbnail');
        currentThumbnails.forEach((thumb, i) => {
            if (i === currentImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    // Navigation button handlers - switch between projects
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const newProjectIndex = currentProjectIndex === 0 ? projects.length - 1 : currentProjectIndex - 1;
            currentImageIndex = 0; // Reset to first image of new project
            updateProject(newProjectIndex);
        });

        nextBtn.addEventListener('click', () => {
            const newProjectIndex = currentProjectIndex === projects.length - 1 ? 0 : currentProjectIndex + 1;
            currentImageIndex = 0; // Reset to first image of new project
            updateProject(newProjectIndex);
        });
    }

    // Auto-rotate gallery - switch between projects
    setInterval(() => {
        const nextProjectIndex = currentProjectIndex === projects.length - 1 ? 0 : currentProjectIndex + 1;
        currentImageIndex = 0; // Reset to first image of new project
        updateProject(nextProjectIndex);
    }, 8000); // Change project every 8 seconds

    // Initialize first project
    updateProject(0);
});
