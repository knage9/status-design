// Contacts Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const contactForm = document.querySelector('.contacts__form');
    const mainOptions = document.querySelectorAll('.main-option');
    const additionalOptions = document.querySelectorAll('.additional-option');
    const submitBtn = document.querySelector('.contacts__submit');

    // Input elements
    const contactName = document.getElementById('contactName');
    const contactPhone = document.getElementById('contactPhone');
    const contactCar = document.getElementById('contactCar');

    // Error elements
    const nameError = document.getElementById('contactNameError');
    const phoneError = document.getElementById('contactPhoneError');
    const carError = document.getElementById('contactCarError');

    // Discount elements
    const discountSection = document.getElementById('discountSection');
    const discountPercent = document.getElementById('discountPercent');

    // Thank you popup elements
    const thankYouPopup = document.getElementById('contactsPopupOverlay');
    const thankYouClose = document.getElementById('contactsPopupClose');
    const thankYouBtn = document.getElementById('contactsSuccessBtn');

    // State variables
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
            discountSection.style.display = 'block';
        } else {
            discountSection.style.display = 'none';
        }
        formData.discount = discount;
    }

    // Validation functions
    function validateName() {
        const name = contactName.value.trim();
        if (name.length < 2) {
            nameError.textContent = 'Имя должно содержать минимум 2 символа';
            nameError.classList.add('active');
            return false;
        }
        nameError.classList.remove('active');
        return true;
    }

    function validatePhone() {
        const phone = contactPhone.value.trim();
        if (!phoneRegex.test(phone)) {
            phoneError.textContent = 'Введите корректный номер телефона';
            phoneError.classList.add('active');
            return false;
        }
        phoneError.classList.remove('active');
        return true;
    }

    function validateCarModel() {
        const car = contactCar.value.trim();
        if (car.length < 3) {
            carError.textContent = 'Укажите марку и модель автомобиля';
            carError.classList.add('active');
            return false;
        }
        carError.classList.remove('active');
        return true;
    }

    // Update submit button state
    function updateSubmitButton() {
        const hasMainService = selectedMainService !== '';
        const hasContactInfo = contactName.value.trim() && contactPhone.value.trim() && contactCar.value.trim();

        submitBtn.disabled = !(hasMainService && hasContactInfo);
    }

    // Main service selection
    mainOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            mainOptions.forEach(opt => opt.classList.remove('main-option--active'));
            // Add active class to clicked option
            this.classList.add('main-option--active');
            selectedMainService = this.dataset.service;

            updateSubmitButton();
        });
    });

    // Additional services selection
    additionalOptions.forEach(option => {
        option.addEventListener('click', function() {
            const service = this.dataset.option;

            if (selectedAdditionalServices.includes(service)) {
                // Remove service
                selectedAdditionalServices = selectedAdditionalServices.filter(s => s !== service);
                this.classList.remove('additional-option--selected');
            } else {
                // Add service
                selectedAdditionalServices.push(service);
                this.classList.add('additional-option--selected');
            }

            // Update discount
            updateDiscountDisplay();
        });
    });

    // Real-time validation
    contactName.addEventListener('input', function() {
        validateName();
        updateSubmitButton();
    });

    contactPhone.addEventListener('input', function() {
        validatePhone();
        updateSubmitButton();
    });

    contactCar.addEventListener('input', function() {
        validateCarModel();
        updateSubmitButton();
    });

    // Phone number formatting
    contactPhone.addEventListener('input', function(e) {
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
        updateSubmitButton();
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields
        const isNameValid = validateName();
        const isPhoneValid = validatePhone();
        const isCarValid = validateCarModel();
        const hasMainService = selectedMainService !== '';

        if (!isNameValid || !isPhoneValid || !isCarValid || !hasMainService) {
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Отправляем...';
        submitBtn.disabled = true;

        // Prepare form data
        formData = {
            name: contactName.value.trim(),
            phone: contactPhone.value.trim(),
            carModel: contactCar.value.trim(),
            mainService: selectedMainService,
            additionalServices: [...selectedAdditionalServices],
            discount: calculateDiscount(),
            timestamp: new Date().toISOString()
        };

        // Simulate API call to CRM
        setTimeout(() => {
            console.log('Form data to send to CRM:', formData);

            // Show thank you popup
            showThankYouPopup();

            // Reset loading state
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Отправить заявку';

            // You can uncomment this to actually send data to CRM
            // sendToCRM(formData);
        }, 1500);
    });

    // Show thank you popup
    function showThankYouPopup() {
        thankYouPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close thank you popup
    function closeThankYouPopup() {
        thankYouPopup.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Thank you popup event listeners
    thankYouClose.addEventListener('click', closeThankYouPopup);
    thankYouBtn.addEventListener('click', closeThankYouPopup);
    thankYouPopup.addEventListener('click', function(e) {
        if (e.target === thankYouPopup) {
            closeThankYouPopup();
        }
    });

    // Close popup on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && thankYouPopup.classList.contains('active')) {
            closeThankYouPopup();
        }
    });

    // Function to send data to CRM (placeholder)
    function sendToCRM(data) {
        // This is where you would integrate with your CRM system
        // For example, using fetch to send data to your backend

        fetch('/api/submit-contacts-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('CRM response:', result);
            showThankYouPopup();
        })
        .catch(error => {
            console.error('CRM error:', error);
            // Show error message or retry
        })
        .finally(() => {
            // Reset loading state
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Отправить заявку';
            submitBtn.disabled = false;
        });
    }

    // Initialize form state
    updateSubmitButton();
    updateDiscountDisplay();

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    // Observe animated elements
    document.querySelectorAll('.contacts__left, .contacts__right').forEach(el => {
        observer.observe(el);
    });
});
