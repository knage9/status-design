// Contacts page popup functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize popup functionality for contacts page
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

    // Discount elements - using standard selectors for popup
    const discountSection = document.getElementById('discountSection');
    const discountPercent = document.getElementById('discountPercent');

    // Check if popup elements exist before adding event listeners
    if (!popupOverlay || !popupClose || !continueBtn || !submitBtn || !successBtn) {
        return; // Popup elements not found on this page, exit silently
    }

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

    // Service costs for discount calculation
    const serviceCosts = {
        'antigravity-film': 50000,  // Оклейка антигравийной пленкой
        'disk-painting': 30000,     // Окрас колесных дисков
        'cleaning': 15000,          // Химчистка
        'ceramic': 25000,           // Керамика
        'polish': 10000             // Полировка
    };

    // Enhanced discount calculation based on selected services
    function calculateDiscount() {
        if (selectedAdditionalServices.length === 0) {
            return 0;
        }

        // Base discount based on quantity
        const baseDiscounts = [0, 2, 4, 8, 12, 16, 20];
        const baseDiscount = Math.min(baseDiscounts[selectedAdditionalServices.length] || 20, 20);

        // Additional discount based on total cost
        let totalCost = 0;
        selectedAdditionalServices.forEach(service => {
            totalCost += serviceCosts[service] || 0;
        });

        // 0.5% for every 10,000 rubles
        const costBonus = Math.floor(totalCost / 10000) * 0.5;

        // Total discount (max 20%)
        const totalDiscount = Math.min(baseDiscount + costBonus, 20);

        return Math.round(totalDiscount);
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
        console.log('Contacts form data to send to CRM:', formData);

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

    // Make openPopup function globally available for other buttons on the site
    window.openPopup = openPopup;

    // Add event listeners to existing buttons on the site
    const existingButtons = document.querySelectorAll('.btn-primary, .footer__button, .burger-menu__btn');
    existingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openPopup();
        });
    });
});
