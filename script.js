// Main Page Functionality (index.html)
document.addEventListener('DOMContentLoaded', function() {
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
                    tags: ["Li9", "Карбон"]
                }
            ]
        },
        {
            main: {
                text: "Шумоизоляция выполнена на высшем уровне! Теперь в салоне абсолютная тишина, даже на высокой скорости. Рекомендую всем владельцам премиальных авто.",
                image: "img/review-2.png",
                tags: ["BMW X7", "Шумоизоляция", "Премиум"]
            },
            sides: [
                {
                    text: "Карбоновые детали преобразили мою машину полностью. Качество на высоте...",
                    image: "img/review-3.png",
                    tags: ["Mercedes S-Class", "Карбон"]
                },
                {
                    text: "Антихром с покраской сделали идеально. Внимание к деталям поражает...",
                    image: "img/review-1.png",
                    tags: ["Audi A8", "Антихром"]
                }
            ]
        },
        {
            main: {
                text: "Полная шумоизоляция и антихром в комплексе. Машина стала как новая - тише, стильнее, комфортнее. Спасибо за профессиональную работу!",
                image: "img/review-3.png",
                tags: ["Porsche Cayenne", "Комплекс", "Шумоизоляция"]
            },
            sides: [
                {
                    text: "Детали в карбоне выглядят потрясающе. Монтаж выполнен идеально...",
                    image: "img/review-1.png",
                    tags: ["Range Rover", "Карбон"]
                },
                {
                    text: "Антихром преобразил внешний вид автомобиля. Теперь он выглядит намного солиднее...",
                    image: "img/review-2.png",
                    tags: ["Lexus LX", "Антихром"]
                }
            ]
        }
    ];

    let currentSlide = 0;
    const maxSlides = reviewsData.length - 1;

    function updateReviews() {
        const data = reviewsData[currentSlide];

        // Add fade-out class to all cards
        const allCards = document.querySelectorAll('.review-card');
        allCards.forEach(card => {
            card.classList.add('fade-out');
        });

        // Update content after fade-out animation starts
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
            data.sides.forEach((sideData, index) => {
                if (sideCards[index]) {
                    const sideText = sideCards[index].querySelector('.review-card__text');
                    const sideImage = sideCards[index].querySelector('.review-card__image img');

                    if (sideText) sideText.textContent = sideData.text;
                    if (sideImage) sideImage.src = sideData.image;

                    // Update tags for side cards
                    const sideTagsContainers = document.querySelectorAll('.review-card__tags--side');
                    if (sideTagsContainers[index]) {
                        sideTagsContainers[index].innerHTML = sideData.tags.map(tag => `<span class="review-tag">${tag}</span>`).join('');
                    }
                }
            });

            // Remove fade-out and add fade-in classes
            allCards.forEach(card => {
                card.classList.remove('fade-out');
                card.classList.add('fade-in');
            });

            // Remove fade-in class after animation completes
            setTimeout(() => {
                allCards.forEach(card => {
                    card.classList.remove('fade-in');
                });
            }, 400);

        }, 200);

        // Update button states
        if (prevBtn && nextBtn) {
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide >= maxSlides;
        }
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentSlide > 0) {
                currentSlide--;
                updateReviews();
            }
        });

        nextBtn.addEventListener('click', function() {
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

        mainCard.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        mainCard.addEventListener('touchmove', function(e) {
            e.preventDefault(); // Prevent scrolling while swiping
        });

        mainCard.addEventListener('touchend', function(e) {
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
                header.addEventListener('click', function() {
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
});

// Popup будет подключаться отдельно для главной страницы
