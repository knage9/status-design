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

        // Add fade-out class to all cards
        const allCards = document.querySelectorAll('.review-card');
        allCards.forEach(card => {
            card.classList.add('fade-out');
        });

        // Update content after fade-out animation starts
        setTimeout(() => {
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

        // Change text and icon
        const burgerText = burgerToggle.querySelector('.burger-menu__text');
        if (burgerText) {
            burgerText.textContent = 'Закрыть';
        }

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

        // Change text and icon back
        const burgerText = burgerToggle.querySelector('.burger-menu__text');
        if (burgerText) {
            burgerText.textContent = 'Меню';
        }

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

// Premium Animations with Intersection Observer
document.addEventListener('DOMContentLoaded', function() {
    // Animation for titles and headings
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('h1, h2, h3, .features__title, .services__title, .gallery__title, .reviews__title, .news__title');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = 'fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                        entry.target.style.opacity = '1';
                    }, index * 100); // Stagger effect
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(element => {
            element.style.opacity = '0';
            observer.observe(element);
        });
    };

    // Auto shimmer effect for buttons
    const addAutoShimmer = () => {
        const buttons = document.querySelectorAll('.btn-primary, .about-btn, .footer__button');

        buttons.forEach((button, index) => {
            // Random shimmer every 3-5 seconds
            const shimmerInterval = setInterval(() => {
                if (!button.matches(':hover')) {
                    button.style.animation = 'diamondShine 2s ease-in-out';
                    setTimeout(() => {
                        button.style.animation = 'diamondShine 4s ease-in-out infinite';
                        button.style.animationDelay = '2s';
                    }, 2000);
                }
            }, 3000 + (index * 1000)); // Stagger intervals

            // Clear interval on hover
            button.addEventListener('mouseenter', () => {
                clearInterval(shimmerInterval);
            });

            button.addEventListener('mouseleave', () => {
                button.style.animation = 'diamondShine 4s ease-in-out infinite';
                button.style.animationDelay = '2s';
            });
        });
    };


    // Image lazy loading with zoom effect
    const enhanceImages = () => {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            img.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

            const wrapper = img.closest('.gallery__item, .news-card__image, .review-card__image');
            if (wrapper) {
                wrapper.style.overflow = 'hidden';

                wrapper.addEventListener('mouseenter', () => {
                    img.style.transform = 'scale(1.1)';
                });

                wrapper.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)';
                });
            }
        });
    };

    // Feature cards stagger animation
    const animateFeatureCards = () => {
        const cards = document.querySelectorAll('.feature-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.animation = 'slideInFromLeft 0.6s ease-out forwards';
                    }, index * 150);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            observer.observe(card);
        });
    };

    // Initialize all animations
    animateOnScroll();
    addAutoShimmer();
    enhanceTabs();
    enhanceImages();
    animateFeatureCards();

    // Re-run animations on dynamic content changes
    const observer = new MutationObserver(() => {
        animateOnScroll();
        addAutoShimmer();
        enhanceTabs();
        enhanceImages();
        animateFeatureCards();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Multi-step Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Popup elements
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    const continueBtn = document.getElementById('continueBtn');
    const submitBtn = document.getElementById('submitBtn');
    const successBtn = document.getElementById('successBtn');

    // Form elements
    const userName = document.getElementById('userName');
    const userPhone = document.getElementById('userPhone');
    const carModel = document.getElementById('carModel');

    // Step elements
    const popupSteps = document.querySelectorAll('.popup__step');
    const popupTitle = document.getElementById('popupTitle');

    // Service selection elements
    const serviceBtns = document.querySelectorAll('.popup__service-btn');
    const additionalBtns = document.querySelectorAll('.popup__additional-btn');

    // Error elements
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const carError = document.getElementById('carError');
    const mainServiceError = document.getElementById('mainServiceError');

    // Discount elements
    const discountSection = document.getElementById('discountSection');
    const discountPercent = document.getElementById('discountPercent');

    // State variables
    let currentStep = 1;
    let selectedMainService = '';
    let selectedAdditionalServices = [];
    let formData = {
        name: '',
        phone: '',
        carModel: '',
        mainService: '',
        additionalServices: [],
        discount: 0,
        timestamp: ''
    };

    // Phone number validation regex (Russia format)
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

    // Discount calculation based on selected services
    function calculateDiscount() {
        let discount = 0;
        if (selectedAdditionalServices.length >= 2) {
            discount = 10;
        } else if (selectedAdditionalServices.length >= 1) {
            discount = 5;
        }
        return discount;
    }

    // Update discount display
    function updateDiscountDisplay() {
        const discount = calculateDiscount();
        if (discount > 0) {
            discountPercent.textContent = `-${discount}%`;
            discountSection.style.display = 'flex';
        } else {
            discountSection.style.display = 'none';
        }
        formData.discount = discount;
    }

    // Validation functions
    function validateName() {
        const name = userName.value.trim();
        if (name.length < 2) {
            nameError.textContent = 'Имя должно содержать минимум 2 символа';
            nameError.classList.add('active');
            return false;
        }
        nameError.classList.remove('active');
        return true;
    }

    function validatePhone() {
        const phone = userPhone.value.trim();
        if (!phoneRegex.test(phone)) {
            phoneError.textContent = 'Введите корректный номер телефона';
            phoneError.classList.add('active');
            return false;
        }
        phoneError.classList.remove('active');
        return true;
    }

    function validateCarModel() {
        const car = carModel.value.trim();
        if (car.length < 3) {
            carError.textContent = 'Укажите марку и модель автомобиля';
            carError.classList.add('active');
            return false;
        }
        carError.classList.remove('active');
        return true;
    }

    function validateMainService() {
        if (!selectedMainService) {
            mainServiceError.textContent = 'Выберите основную услугу';
            mainServiceError.classList.add('active');
            return false;
        }
        mainServiceError.classList.remove('active');
        return true;
    }

    // Step navigation
    function goToStep(step) {
        // Hide all steps
        popupSteps.forEach(stepEl => {
            stepEl.classList.remove('popup__step--active');
        });

        // Show target step
        const targetStep = document.querySelector(`[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('popup__step--active');
        }

        currentStep = step;

        // Update popup title and size based on step
        updatePopupTitle(step);
        updatePopupSize(step);

        // Update button visibility and text
        updateStepButtons();
    }

    // Update popup title based on current step
    function updatePopupTitle(step) {
        const titles = {
            1: 'Мы перезвоним и ответим на все вопросы в течение 15 минут',
            2: 'Выберите основную услугу',
            3: 'Выберите дополнительные услуги',
            4: 'Ваш запрос в работе. Перезвоним в течение 15 минут.'
        };

        if (titles[step]) {
            popupTitle.textContent = titles[step];
        }
    }

    // Update popup size based on current step
    function updatePopupSize(step) {
        const popup = document.querySelector('.popup');

        if (step === 4) {
            // Compact size for success step
            popup.classList.add('popup--compact');
        } else {
            // Normal size for other steps
            popup.classList.remove('popup--compact');
        }
    }

    function updateStepButtons() {
        continueBtn.style.display = currentStep < 3 ? 'flex' : 'none';
        submitBtn.style.display = currentStep === 3 ? 'flex' : 'none';
        successBtn.style.display = currentStep === 4 ? 'flex' : 'none';

        // Update button text
        if (currentStep === 1) {
            continueBtn.textContent = 'Продолжить';
        } else if (currentStep === 2) {
            continueBtn.textContent = 'Продолжить';
        }
    }

    // Open popup
    function openPopup() {
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentStep = 1;
        goToStep(1);

        // Reset form
        resetForm();

        // Focus on first input
        setTimeout(() => {
            userName.focus();
        }, 300);
    }

    // Close popup
    function closePopup() {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
        currentStep = 1;
    }

    // Reset form data
    function resetForm() {
        userName.value = '';
        userPhone.value = '';
        carModel.value = '';
        selectedMainService = '';
        selectedAdditionalServices = [];

        // Reset service buttons
        serviceBtns.forEach(btn => btn.classList.remove('popup__service-btn--active'));
        additionalBtns.forEach(btn => btn.classList.remove('popup__additional-btn--selected'));

        // Hide discount
        discountSection.style.display = 'none';

        // Clear errors
        document.querySelectorAll('.popup__error').forEach(error => {
            error.classList.remove('active');
        });

        formData = {
            name: '',
            phone: '',
            carModel: '',
            mainService: '',
            additionalServices: [],
            discount: 0,
            timestamp: ''
        };
    }

    // Step 1: Continue button
    continueBtn.addEventListener('click', function() {
        if (currentStep === 1) {
            // Validate step 1
            const isNameValid = validateName();
            const isPhoneValid = validatePhone();
            const isCarValid = validateCarModel();

            if (isNameValid && isPhoneValid && isCarValid) {
                // Save form data
                formData.name = userName.value.trim();
                formData.phone = userPhone.value.trim();
                formData.carModel = carModel.value.trim();
                formData.timestamp = new Date().toISOString();

                goToStep(2);
            }
        } else if (currentStep === 2) {
            // Validate step 2
            if (validateMainService()) {
                formData.mainService = selectedMainService;
                goToStep(3);
                updateDiscountDisplay();
            }
        }
    });

    // Main service selection
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            serviceBtns.forEach(b => b.classList.remove('popup__service-btn--active'));

            // Add active class to clicked button
            this.classList.add('popup__service-btn--active');
            selectedMainService = this.dataset.service;

            // Clear error
            mainServiceError.classList.remove('active');
        });
    });

    // Additional services selection
    additionalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const service = this.dataset.service;

            if (selectedAdditionalServices.includes(service)) {
                // Remove service
                selectedAdditionalServices = selectedAdditionalServices.filter(s => s !== service);
                this.classList.remove('popup__additional-btn--selected');
            } else {
                // Add service
                selectedAdditionalServices.push(service);
                this.classList.add('popup__additional-btn--selected');
            }

            // Update discount
            updateDiscountDisplay();
        });
    });

    // Submit form
    submitBtn.addEventListener('click', function() {
        // Save additional services and discount
        formData.additionalServices = [...selectedAdditionalServices];
        formData.discount = calculateDiscount();

        // Here you would typically send data to CRM
        console.log('Form data to send to CRM:', formData);

        // Show success step
        goToStep(4);

        // You can uncomment this to actually send data to CRM
        // sendToCRM(formData);
    });

    // Success button
    successBtn.addEventListener('click', function() {
        closePopup();
    });

    // Close popup events
    popupClose.addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
            closePopup();
        }
    });

    // Real-time validation
    userName.addEventListener('input', validateName);
    userPhone.addEventListener('input', validatePhone);
    carModel.addEventListener('input', validateCarModel);

    // Phone number formatting
    userPhone.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        // Format phone number
        if (value.length >= 6) {
            value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{1})(\d{3})/, '+$1 ($2');
        } else if (value.length >= 1) {
            value = '+' + value;
        }

        e.target.value = value;
        validatePhone();
    });

    // Function to send data to CRM (placeholder)
    function sendToCRM(data) {
        // This is where you would integrate with your CRM system
        // For example, using fetch to send data to your backend

        fetch('/api/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('CRM response:', result);
        })
        .catch(error => {
            console.error('CRM error:', error);
        });
    }

    // Make openPopup function globally available for other buttons on the site
    window.openPopup = openPopup;

    // Add event listeners to existing buttons on the site
    const existingButtons = document.querySelectorAll('.btn-primary, .about-btn, .footer__button, .burger-menu__btn');
    existingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openPopup();
        });
    });
});
