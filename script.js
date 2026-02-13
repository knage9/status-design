// Main Page Functionality (index.html)
document.addEventListener('DOMContentLoaded', function () {
    // Reviews slider functionality
    const reviewsContainer = document.querySelector('.reviews__container');
    const prevBtn = document.querySelector('.reviews__nav-btn--prev');
    const nextBtn = document.querySelector('.reviews__nav-btn--next');

    // Data for reviews
    const reviewsData = [
        {
            main: {
                text: "Сначала сомневался, как будет смотреться матовый оттенок на моей машине, но ребята сделали просто идеально! Покраска ровная, оттенок глубокий, ощущение премиум-класса сразу заметно.",
                image: "img/review-1.png",
                tags: ["GAC GS8", "Антихром", "Решётка радиатора"]
            },
            sides: [
                {
                    text: "Заказывал детали в карбоне — получилось даже лучше, чем ожидал. Всё аккуратно...",
                    image: "img/review-2.png",
                    tags: ["GLS Майбах", "Карбон"]
                },
                {
                    text: "Делал антихром — результат превзошёл ожидания. Машина заиграла по-новому...",
                    image: "img/review-3.png",
                    tags: ["Li9", "Антихром"]
                }
            ]
        },
        {
            main: {
                text: "Заказывал детали в карбоне — получилось даже лучше, чем ожидал. Всё аккуратно...",
                image: "img/review-2.png",
                tags: ["GLS Майбах", "Карбон"]
            },
            sides: [
                {
                    text: "Делал антихром — результат превзошёл ожидания. Машина заиграла по-новому...",
                    image: "img/review-3.png",
                    tags: ["Li9", "Антихром"]
                },
                {
                    text: "Сначала сомневался, как будет смотреться матовый оттенок на моей машине, но ребята сделали просто идеально! Покраска ровная, оттенок глубокий, ощущение премиум-класса сразу заметно.",
                    image: "img/review-1.png",
                    tags: ["GAC GS8", "Антихром", "Решётка радиатора"]
                }
            ]
        },
        {
            main: {
                text: "Делал антихром — результат превзошёл ожидания. Машина заиграла по-новому...",
                image: "img/review-3.png",
                tags: ["Li9", "Антихром"]
            },
            sides: [
                {
                    text: "Сначала сомневался, как будет смотреться матовый оттенок на моей машине, но ребята сделали просто идеально! Покраска ровная, оттенок глубокий, ощущение премиум-класса сразу заметно.",
                    image: "img/review-1.png",
                    tags: ["GAC GS8", "Антихром", "Решётка радиатора"]
                },
                {
                    text: "Заказывал детали в карбоне — получилось даже лучше, чем ожидал. Всё аккуратно...",
                    image: "img/review-2.png",
                    tags: ["GLS Майбах", "Карбон"]
                }
            ]
        }
    ];

    let currentSlide = 0;
    const maxSlides = reviewsData.length - 1;

    function updateReviews() {
        const data = reviewsData[currentSlide];

        // Add fade-out class to all cards and tag containers
        const allCards = document.querySelectorAll('.review-card');
        const allTags = document.querySelectorAll('.review-card__tags');

        allCards.forEach(card => card.classList.add('fade-out'));
        allTags.forEach(tag => tag.classList.add('fade-out'));

        // Update content after fade-out animation completes (0.4s match)
        setTimeout(() => {
            // Update main card
            const mainCard = document.querySelector('.review-card--main');
            if (mainCard) {
                const mainText = mainCard.querySelector('.review-card__text');
                const mainImage = mainCard.querySelector('.review-card__image img');

                if (mainText) mainText.textContent = data.main.text;
                if (mainImage) mainImage.src = data.main.image;
            }

            // Update tags for main card
            const mainTagsContainer = document.querySelector('.review-card__tags--main');
            if (mainTagsContainer) {
                mainTagsContainer.innerHTML = data.main.tags.map(tag => `<span class="review-tag">${tag}</span>`).join('');
            }

            // Update side cards
            const sideCards = document.querySelectorAll('.review-card--side');
            const sideTagsGroups = document.querySelectorAll('.review-card__tags--side');

            data.sides.forEach((sideData, index) => {
                if (sideCards[index]) {
                    const sideText = sideCards[index].querySelector('.review-card__text');
                    const sideImage = sideCards[index].querySelector('.review-card__image img');

                    if (sideText) sideText.textContent = sideData.text;
                    if (sideImage) sideImage.src = sideData.image;
                }

                if (sideTagsGroups[index]) {
                    sideTagsGroups[index].innerHTML = sideData.tags.map(tag => `<span class="review-tag">${tag}</span>`).join('');
                }
            });

            // Remove fade-out and add fade-in
            allCards.forEach(card => {
                card.classList.remove('fade-out');
                card.classList.add('fade-in');
            });
            allTags.forEach(tag => {
                tag.classList.remove('fade-out');
                tag.classList.add('fade-in');
            });

            // Clean up animation classes
            setTimeout(() => {
                allCards.forEach(card => card.classList.remove('fade-in'));
                allTags.forEach(tag => tag.classList.remove('fade-in'));
            }, 400);

        }, 400);

        // Update button states
        if (prevBtn && nextBtn) {
            prevBtn.disabled = false; // Allow infinite-like feel if desired, or keep logic
            nextBtn.disabled = false;

            // If you want standard bounds:
            // prevBtn.disabled = currentSlide === 0;
            // nextBtn.disabled = currentSlide >= maxSlides;
        }
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function () {
            if (currentSlide > 0) {
                currentSlide--;
                updateReviews();
            }
        });

        nextBtn.addEventListener('click', function () {
            if (currentSlide < maxSlides) {
                currentSlide++;
                updateReviews();
            }
        });
    }

    // Touch/Swipe functionality for mobile devices
    const mainCard = document.querySelector('.review-card--main');
    if (mainCard) {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        mainCard.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        mainCard.addEventListener('touchmove', function (e) {
            e.preventDefault(); // Prevent scrolling while swiping
        });

        mainCard.addEventListener('touchend', function (e) {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0 && currentSlide > 0) {
                    // Swipe right - previous slide
                    currentSlide--;
                    updateReviews();
                } else if (deltaX < 0 && currentSlide < maxSlides) {
                    // Swipe left - next slide
                    currentSlide++;
                    updateReviews();
                }
            }
        });
    }

    // FAQ Accordion functionality (only for main page)
    const faqItems = document.querySelectorAll('.about-content .faq-item');
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

    // Initialize reviews
    updateReviews();

    // Services form image switching functionality
    const servicesImageBlock = document.querySelector('.services__image-block');
    const servicesBgImage = document.querySelector('.services__bg-image');
    const mainOptions = document.querySelectorAll('.main-option');

    // Default dark background
    if (servicesImageBlock) {
        servicesImageBlock.style.backgroundColor = '#0B0D10';
    }

    // Handle main service selection
    if (mainOptions.length > 0) {
        mainOptions.forEach(option => {
            option.addEventListener('click', function () {
                const service = this.getAttribute('data-service');

                // Remove active class from all options
                mainOptions.forEach(opt => opt.classList.remove('main-option--active'));

                // Add active class to clicked option
                this.classList.add('main-option--active');

                // Change image based on selected service
                if (servicesBgImage) {
                    if (service === 'carbon') {
                        servicesBgImage.src = 'img/carbon.png';
                        servicesBgImage.alt = 'Carbon service';
                    } else if (service === 'antichrome') {
                        servicesBgImage.src = 'img/antichrome.png';
                        servicesBgImage.alt = 'Antichrome service';
                    }
                }

                // Update background color based on selection
                if (servicesImageBlock) {
                    if (service === 'carbon') {
                        servicesImageBlock.style.backgroundColor = '#0B0D10'; // Dark background for carbon
                    } else if (service === 'antichrome') {
                        servicesImageBlock.style.backgroundColor = '#1a1a1a'; // Slightly different dark for antichrome
                    }
                }
            });
        });
    }
});

// Popup будет подключаться отдельно для главной страницы

// Back to Top Button Functionality
document.addEventListener('DOMContentLoaded', function () {
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) {
        // Smooth scroll to top when button is clicked
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
