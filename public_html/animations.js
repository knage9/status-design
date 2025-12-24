// Common Animations Component
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

    // About section scroll animation
    const animateAboutSection = () => {
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
    };

    // Contact labels parallax effect
    const initContactParallax = () => {
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
    };

    // Tabs scroll behavior for all pages
    const initTabsScrollBehavior = () => {
        // Находим все типы табов на странице
        const heroTabs = document.querySelector('.hero__tabs');
        const pageTabs = document.querySelector('.page-tabs');
        const bottomTabs = document.querySelector('.bottom-tabs');

        const allTabs = [];
        if (heroTabs) allTabs.push(heroTabs);
        if (pageTabs) allTabs.push(pageTabs);
        if (bottomTabs) allTabs.push(bottomTabs);

        if (allTabs.length === 0) return;

        let lastScrollY = window.scrollY;
        let isScrollingDown = false;
        let scrollTimeout;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDifference = currentScrollY - lastScrollY;

            // Определяем направление скролла
            if (scrollDifference > 3) {
                isScrollingDown = true;
            } else if (scrollDifference < -3) {
                isScrollingDown = false;
            }

            // Очищаем предыдущий таймаут
            clearTimeout(scrollTimeout);

            // Устанавливаем новый таймаут для применения изменений
            scrollTimeout = setTimeout(() => {
                if (isScrollingDown && currentScrollY > 80) {
                    // Скрываем все табы при скролле вниз
                    allTabs.forEach(tabs => {
                        tabs.classList.add('tabs--hidden');
                        tabs.classList.remove('tabs--visible');
                    });
                } else {
                    // Показываем все табы при скролле вверх
                    allTabs.forEach(tabs => {
                        tabs.classList.add('tabs--visible');
                        tabs.classList.remove('tabs--hidden');
                    });
                }
            }, 30); // Уменьшенная задержка для более отзывчивого поведения

            lastScrollY = currentScrollY;
        };

        // Добавляем обработчик скролла
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Инициализируем состояние (табы видимы при загрузке)
        allTabs.forEach(tabs => {
            tabs.classList.add('tabs--visible');
        });
    };

    // Initialize all animations
    animateOnScroll();
    addAutoShimmer();
    enhanceImages();
    animateFeatureCards();
    animateAboutSection();
    initContactParallax();
    initTabsScrollBehavior();

    // Re-run animations on dynamic content changes
    const observer = new MutationObserver(() => {
        animateOnScroll();
        addAutoShimmer();
        enhanceImages();
        animateFeatureCards();
        initTabsScrollBehavior();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
