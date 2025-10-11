// Services functionality
document.addEventListener('DOMContentLoaded', function() {
    const mainOptions = document.querySelectorAll('.main-option');
    const additionalOptions = document.querySelectorAll('.additional-option');
    const ctaButton = document.querySelector('.services__cta');

    let selectedMainService = null;
    let selectedAdditionalServices = new Set();

    // Main service selection
    mainOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            mainOptions.forEach(opt => opt.classList.remove('main-option--active'));
            // Add active class to clicked option
            this.classList.add('main-option--active');
            selectedMainService = this.dataset.service;

            updateCTAButton();
        });
    });

    // Additional services selection
    additionalOptions.forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('additional-option--selected');

            const service = this.dataset.option;
            if (selectedAdditionalServices.has(service)) {
                selectedAdditionalServices.delete(service);
            } else {
                selectedAdditionalServices.add(service);
            }

            updateCTAButton();
        });
    });

    function updateCTAButton() {
        const hasSelection = selectedMainService || selectedAdditionalServices.size > 0;
        ctaButton.disabled = !hasSelection;
    }

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

        // Update main card
        const mainCard = document.querySelector('.review-card--main');
        const mainText = mainCard.querySelector('.review-card__text');
        const mainImage = mainCard.querySelector('.review-card__image img');

        mainText.textContent = data.main.text;
        mainImage.src = data.main.image;

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

                sideText.textContent = sideData.text;
                sideImage.src = sideData.image;

                // Update tags for side cards
                const sideTagsContainers = document.querySelectorAll('.review-card__tags--side');
                if (sideTagsContainers[index]) {
                    sideTagsContainers[index].innerHTML = sideData.tags.map(tag => `<span class="review-tag">${tag}</span>`).join('');
                }
            }
        });

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

    // Initialize reviews
    updateReviews();

    // Burger Menu functionality
    const burgerToggle = document.getElementById('burgerToggle');
    const burgerDropdown = document.getElementById('burgerDropdown');
    const burgerOverlay = document.getElementById('burgerOverlay');
    const burgerLinks = document.querySelectorAll('.burger-menu__link');

    let isMenuOpen = false;

    // Function to toggle body scroll
    function toggleBodyScroll(disable) {
        if (disable) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px'; // Prevent layout shift
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }

    // Function to open burger menu
    function openBurgerMenu() {
        isMenuOpen = true;
        burgerToggle.classList.add('active');
        burgerDropdown.classList.add('active');
        burgerOverlay.classList.add('active');
        toggleBodyScroll(true);

        // Focus management for accessibility
        burgerDropdown.setAttribute('aria-hidden', 'false');
        burgerToggle.setAttribute('aria-expanded', 'true');
    }

    // Function to close burger menu
    function closeBurgerMenu() {
        isMenuOpen = false;
        burgerToggle.classList.remove('active');
        burgerDropdown.classList.remove('active');
        burgerOverlay.classList.remove('active');
        toggleBodyScroll(false);

        // Focus management for accessibility
        burgerDropdown.setAttribute('aria-hidden', 'true');
        burgerToggle.setAttribute('aria-expanded', 'false');
    }

    // Toggle burger menu on button click
    if (burgerToggle) {
        burgerToggle.addEventListener('click', function() {
            if (isMenuOpen) {
                closeBurgerMenu();
            } else {
                openBurgerMenu();
            }
        });
    }

    // Close burger menu when clicking on overlay
    if (burgerOverlay) {
        burgerOverlay.addEventListener('click', closeBurgerMenu);
    }

    // Close burger menu when clicking on menu links
    burgerLinks.forEach(link => {
        link.addEventListener('click', closeBurgerMenu);
    });

    // Close burger menu on Escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeBurgerMenu();
        }
    });

    // Close burger menu on window resize if screen becomes larger than 1000px
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1000 && isMenuOpen) {
            closeBurgerMenu();
        }
    });

    // Initialize accessibility attributes
    if (burgerDropdown) {
        burgerDropdown.setAttribute('aria-hidden', 'true');
    }
    if (burgerToggle) {
        burgerToggle.setAttribute('aria-expanded', 'false');
        burgerToggle.setAttribute('aria-controls', 'burgerDropdown');
        burgerToggle.setAttribute('aria-label', 'Открыть меню навигации');
    }

    // About section scroll animation
    const aboutTitle = document.querySelector('.about-title');
    if (aboutTitle) {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start animation when element comes into view
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.backgroundPosition = '0 0';
                        entry.target.style.filter = 'drop-shadow(0 0 0px rgba(42, 39, 37, 0))';
                    }, 150);
                }
            });
        }, observerOptions);

        observer.observe(aboutTitle);
    }

    // Contact labels parallax effect
    const contactLabels = document.querySelectorAll('.contact-label');
    const aboutContactText = document.querySelector('.about-contact-text');

    if (contactLabels.length > 0 && aboutContactText) {
        document.addEventListener('mousemove', function(e) {
            const rect = aboutContactText.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const deltaX = (mouseX - centerX) / centerX;
            const deltaY = (mouseY - centerY) / centerY;

            contactLabels.forEach((label, index) => {
                const moveX = deltaX * (15 + index * 5); // Разный коэффициент для каждого лейбла
                const moveY = deltaY * (10 + index * 3);

                label.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${index === 0 ? -5 : 15}deg)`;
            });
        });
    }

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.about-content .faq-item');

    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        const content = item.querySelector('.faq-content');
        const description = item.querySelector('.faq-description');

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
    });
});
