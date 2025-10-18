// Antichrome Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.querySelector('.antichrome-form__form');
    const submitBtn = document.querySelector('.antichrome-form__submit');
    const nameInput = document.getElementById('antichromeFormName');
    const phoneInput = document.getElementById('antichromeFormPhone');
    const carInput = document.getElementById('antichromeFormCar');

    // Error elements
    const nameError = document.getElementById('antichromeFormNameError');
    const phoneError = document.getElementById('antichromeFormPhoneError');
    const carError = document.getElementById('antichromeFormCarError');

    // Service selection
    const additionalOptions = document.querySelectorAll('.additional-option');
    const discountSection = document.getElementById('antichromeDiscountSection');
    const discountPercent = document.getElementById('antichromeDiscountPercent');

    // State
    let selectedMainService = 'antichrome'; // Default service for antichrome page
    let selectedAdditionalServices = [];
    let discount = 0;

    // Service costs for discount calculation (same as contacts page)
    const serviceCosts = {
        'antigravity-film': 50000,  // Оклейка антигравийной пленкой
        'disk-painting': 30000,     // Окрас колесных дисков
        'cleaning': 15000,          // Химчистка
        'ceramic': 25000,           // Керамика
        'polish': 10000             // Полировка
    };

    // Validation functions
    function validateName() {
        const name = nameInput.value.trim();
        if (name.length < 2) {
            showError(nameError, 'Имя должно содержать минимум 2 символа');
            return false;
        }
        clearError(nameError);
        return true;
    }

    function validatePhone() {
        const phone = phoneInput.value.trim();
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
            showError(phoneError, 'Введите корректный номер телефона');
            return false;
        }
        clearError(phoneError);
        return true;
    }

    function validateCar() {
        const car = carInput.value.trim();
        if (car.length < 3) {
            showError(carError, 'Укажите марку и модель автомобиля');
            return false;
        }
        clearError(carError);
        return true;
    }

    function showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
        }
    }

    function clearError(errorElement) {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
    }

    function updateSubmitButton() {
        const isNameValid = nameInput.value.trim().length >= 2;
        const isPhoneValid = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phoneInput.value.trim());
        const isCarValid = carInput.value.trim().length >= 3;
        const hasMainService = selectedMainService !== '';

        submitBtn.disabled = !(isNameValid && isPhoneValid && isCarValid && hasMainService);
    }

    // Enhanced discount calculation based on selected services (same as contacts page)
    function calculateDiscount() {
        if (selectedAdditionalServices.length === 0) {
            discount = 0;
            discountSection.style.display = 'none';
            return;
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
        discount = Math.min(baseDiscount + costBonus, 20);

        // Update display
        discountPercent.textContent = `-${Math.round(discount)}%`;
        discountSection.style.display = 'block';
    }

    // Event listeners for inputs
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            validateName();
            updateSubmitButton();
        });
        nameInput.addEventListener('blur', validateName);
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Format phone number like in contacts.js
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
        phoneInput.addEventListener('blur', validatePhone);
    }

    if (carInput) {
        carInput.addEventListener('input', function() {
            validateCar();
            updateSubmitButton();
        });
        carInput.addEventListener('blur', validateCar);
    }



    // Additional services selection (improved logic like in contacts.js)
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
            calculateDiscount();
        });
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate all fields
            const isNameValid = validateName();
            const isPhoneValid = validatePhone();
            const isCarValid = validateCar();

            if (isNameValid && isPhoneValid && isCarValid && selectedMainService) {
                // Show loading state
                submitBtn.textContent = 'Отправляем...';
                submitBtn.disabled = true;

                // Simulate form submission
                setTimeout(() => {
                    // Here you would typically send data to server
                    console.log('Form submitted:', {
                        name: nameInput.value,
                        phone: phoneInput.value,
                        car: carInput.value,
                        mainService: selectedMainService,
                        additionalServices: selectedAdditionalServices,
                        discount: discount
                    });

                    // Show success message (you can replace this with actual success handling)
                    alert('Спасибо за заявку! Мы свяжемся с вами в течение 15 минут.');

                    // Reset form
                    form.reset();
                    additionalOptions.forEach(opt => opt.classList.remove('additional-option--selected'));
                    selectedMainService = 'antichrome'; // Reset to default
                    selectedAdditionalServices = [];
                    discount = 0;
                    discountSection.style.display = 'none';
                    submitBtn.textContent = 'Отправить заявку';
                    updateSubmitButton();
                }, 1000);
            }
        });
    }

    // Initialize form state
    updateSubmitButton();
});
