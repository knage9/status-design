// Services Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.services-faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const header = item.querySelector('.services-faq-header');
            const content = item.querySelector('.services-faq-content');

            if (header) {
                header.addEventListener('click', function() {
                    const isActive = item.classList.contains('active');

                    // Close all FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherContent = otherItem.querySelector('.services-faq-content');
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

    // Services form functionality (reusing existing popup scripts)
    // The popup.js and discount-popup.js are already loaded and will handle form interactions

    // Add click handlers for service cards
    const serviceButtons = document.querySelectorAll('.service-card__button');
    serviceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.openPopup) {
                window.openPopup();
            }
        });
    });

    // Add click handlers for additional service cards
    const additionalServiceCards = document.querySelectorAll('.additional-service');
    additionalServiceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.openPopup) {
                window.openPopup();
            }
        });

        // Add cursor pointer style
        card.style.cursor = 'pointer';
    });

    // Add click handlers for footer button
    const footerButton = document.querySelector('.footer__button');
    if (footerButton) {
        footerButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.openPopup) {
                window.openPopup();
            }
        });
    }

    // Add click handlers for burger menu button
    const burgerMenuBtn = document.querySelector('.burger-menu__btn');
    if (burgerMenuBtn) {
        burgerMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.openPopup) {
                window.openPopup();
            }
        });
    }

    // Add click handlers for primary buttons
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.openPopup) {
                window.openPopup();
            }
        });
    });
});
