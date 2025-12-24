// Header Component - Burger Menu functionality
document.addEventListener('DOMContentLoaded', function() {
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
});
