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

    function calculateDiscount() {
        const servicesCount = selectedAdditionalServices.length;
        if (servicesCount >= 3) {
            discount = 15;
        } else if (servicesCount >= 2) {
            discount = 10;
        } else if (servicesCount >= 1) {
            discount = 5;
        } else {
            discount = 0;
        }

        if (discount > 0) {
            discountPercent.textContent = `-${discount}%`;
            discountSection.style.display = 'block';
        } else {
            discountSection.style.display = 'none';
        }
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
        phoneInput.addEventListener('input', function() {
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



    // Additional services selection
    additionalOptions.forEach(option => {
        option.addEventListener('click', function() {
            const service = this.dataset.option;

            if (this.classList.contains('additional-option--selected')) {
                // Deselect service
                this.classList.remove('additional-option--selected');
                selectedAdditionalServices = selectedAdditionalServices.filter(s => s !== service);
            } else {
                // Select service
                this.classList.add('additional-option--selected');
                selectedAdditionalServices.push(service);
            }

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
