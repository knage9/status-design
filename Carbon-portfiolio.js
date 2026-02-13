// Portfolio Gallery Functionality for Carbon page
document.addEventListener('DOMContentLoaded', function () {
    const thumbnails = document.querySelectorAll('.portfolio-result__thumbnail');
    const mainImage = document.getElementById('mainPortfolioImage');
    const mainTitle = document.getElementById('mainPortfolioTitle');
    const mainServices = document.getElementById('mainPortfolioServices');
    const prevBtn = document.querySelector('.portfolio-result__nav-btn--prev');
    const nextBtn = document.querySelector('.portfolio-result__nav-btn--next');

    // Portfolio projects data
    const projects = [
        {
            id: 0,
            title: 'Bentley',
            images: [
                'img/Bentley-Карбон/1.webp',
                'img/Bentley-Карбон/2.webp',
                'img/Bentley-Карбон/3.webp',
                'img/Bentley-Карбон/4.webp',
                'img/Bentley-Карбон/5.webp'
            ],
            thumbnails: [
                'img/Bentley-Карбон/1.webp',
                'img/Bentley-Карбон/2.webp',
                'img/Bentley-Карбон/3.webp',
                'img/Bentley-Карбон/4.webp',
                'img/Bentley-Карбон/5.webp'
            ],
            alt: 'Bentley - Результат карбона',
            services: [

            ]
        },
        {
            id: 1,
            title: 'Chevrolet Corvette',
            images: [
                'img/Chevrolet-Corvette-Карбон/1.webp',
                'img/Chevrolet-Corvette-Карбон/2.webp',
                'img/Chevrolet-Corvette-Карбон/3.webp',
                'img/Chevrolet-Corvette-Карбон/4.webp'
            ],
            thumbnails: [
                'img/Chevrolet-Corvette-Карбон/1.webp',
                'img/Chevrolet-Corvette-Карбон/2.webp',
                'img/Chevrolet-Corvette-Карбон/3.webp',
                'img/Chevrolet-Corvette-Карбон/4.webp'
            ],
            alt: 'Chevrolet Corvette - Результат карбона',
            services: [
            ]
        },
        {
            id: 2,
            title: 'Rolls-Royce',
            images: [
                'img/Rolls-Royce-Карбон/1.webp',
                'img/Rolls-Royce-Карбон/2.webp',
                'img/Rolls-Royce-Карбон/3.webp',
                'img/Rolls-Royce-Карбон/4.webp',
                'img/Rolls-Royce-Карбон/5.webp',
                'img/Rolls-Royce-Карбон/6.webp'
            ],
            thumbnails: [
                'img/Rolls-Royce-Карбон/1.webp',
                'img/Rolls-Royce-Карбон/2.webp',
                'img/Rolls-Royce-Карбон/3.webp',
                'img/Rolls-Royce-Карбон/4.webp',
                'img/Rolls-Royce-Карбон/5.webp',
                'img/Rolls-Royce-Карбон/6.webp'
            ],
            alt: 'Rolls-Royce - Результат карбона',
            services: [
            ]
        },
    ];

    let currentProjectIndex = 0;
    let currentImageIndex = 0;

    // Generate thumbnails for a project
    function generateThumbnails(project) {
        const thumbnailsContainer = document.getElementById('portfolioThumbnails');
        thumbnailsContainer.innerHTML = '';

        project.thumbnails.forEach((thumbnailSrc, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'portfolio-result__thumbnail';
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
        const newThumbnails = document.querySelectorAll('.portfolio-result__thumbnail');
        return newThumbnails;
    }

    // Update portfolio display
    function updatePortfolio(projectIndex) {
        const project = projects[projectIndex];

        // Update main content
        mainImage.src = project.images[currentImageIndex];
        mainImage.alt = project.alt;
        mainTitle.textContent = project.title;

        // Update services list
        mainServices.innerHTML = '';
        project.services.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'portfolio-result__service-item';
            serviceItem.textContent = service;
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
        const currentThumbnails = document.querySelectorAll('.portfolio-result__thumbnail');
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
            updatePortfolio(newProjectIndex);
        });

        nextBtn.addEventListener('click', () => {
            const newProjectIndex = currentProjectIndex === projects.length - 1 ? 0 : currentProjectIndex + 1;
            currentImageIndex = 0; // Reset to first image of new project
            updatePortfolio(newProjectIndex);
        });
    }

    // Auto-rotate gallery - switch between projects
    setInterval(() => {
        const nextProjectIndex = currentProjectIndex === projects.length - 1 ? 0 : currentProjectIndex + 1;
        currentImageIndex = 0; // Reset to first image of new project
        updatePortfolio(nextProjectIndex);
    }, 8000); // Change project every 8 seconds

    // Initialize first project
    updatePortfolio(0);

    // FAQ Accordion functionality for carbon page
    const faqItems = document.querySelectorAll('.faq-section .faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const header = item.querySelector('.faq-header');
            const content = item.querySelector('.faq-content');
            const description = item.querySelector('.faq-description');

            if (header) {
                header.addEventListener('click', function () {
                    const isActive = item.classList.contains('active');

                    // Close all FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherContent = otherItem.querySelector('.faq-content');
                            if (otherContent) {
                                otherContent.classList.remove('active');
                            }
                        }
                    });

                    // Toggle current item
                    if (isActive) {
                        item.classList.remove('active');
                        if (content) {
                            content.classList.remove('active');
                        }
                    } else {
                        item.classList.add('active');
                        if (content) {
                            content.classList.add('active');

                            // Smooth scroll to expanded item
                            setTimeout(() => {
                                item.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                });
                            }, 200);
                        }
                    }
                });
            }
        });
    }
});