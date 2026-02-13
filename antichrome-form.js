// Antichrome & Carbon Form Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Form elements
    const form = document.querySelector('.antichrome-form__form');
    if (!form) return;

    const submitBtn = form.querySelector('.antichrome-form__submit');

    // Helper to find elements by multiple potential IDs (for antichrome/carbon pages)
    const getEl = (ids) => {
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) return el;
        }
        return null;
    };

    const nameInput = getEl(['antichromeFormName', 'carbonFormName']);
    const phoneInput = getEl(['antichromeFormPhone', 'carbonFormPhone']);
    const carInput = getEl(['antichromeFormCar', 'carbonFormCar']);

    // Error elements
    const nameError = getEl(['antichromeFormNameError', 'carbonFormNameError']);
    const phoneError = getEl(['antichromeFormPhoneError', 'carbonFormPhoneError']);
    const carError = getEl(['antichromeFormCarError', 'carbonFormCarError']);

    // Service selection
    const additionalOptions = document.querySelectorAll('.additional-option');
    const discountSection = getEl(['antichromeDiscountSection', 'carbonDiscountSection']);
    const discountPercent = getEl(['antichromeDiscountPercent', 'carbonDiscountPercent']);

    // Success Popup
    const successPopup = document.getElementById('successPopupOverlay');
    const successClose = document.getElementById('successPopupClose');
    const successBtn = document.getElementById('discountSuccessBtn');

    // State
    // Detect main service from hidden field
    const mainServiceInput = form.querySelector('input[name="mainService"]');
    let selectedMainService = mainServiceInput ? mainServiceInput.value : 'antichrome';
    let selectedAdditionalServices = [];
    let discount = 0;

    // Service costs for discount calculation
    const serviceCosts = {
        'antigravity-film': 50000,
        'disk-painting': 30000,
        'cleaning': 15000,
        'ceramic': 25000,
        'polish': 10000
    };

    // Validation functions
    function validateName() {
        if (!nameInput) return true;
        const name = nameInput.value.trim();
        if (name.length < 2) {
            showError(nameError, 'Имя должно содержать минимум 2 символа');
            return false;
        }
        clearError(nameError);
        return true;
    }

    function validatePhone() {
        if (!phoneInput) return true;
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
        if (!carInput) return true;
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
        if (!submitBtn) return;

        const isNameValid = !nameInput || nameInput.value.trim().length >= 2;
        const isPhoneValid = !phoneInput || /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phoneInput.value.trim());
        const isCarValid = !carInput || carInput.value.trim().length >= 3;
        const hasMainService = !!selectedMainService;

        submitBtn.disabled = !(isNameValid && isPhoneValid && isCarValid && hasMainService);
    }

    // Enhanced discount calculation
    function calculateDiscount() {
        if (!discountSection || !discountPercent) return;

        if (selectedAdditionalServices.length === 0) {
            discount = 0;
            discountSection.style.display = 'none';
            return;
        }

        const baseDiscounts = [0, 2, 4, 8, 12, 16, 20];
        const baseDiscount = Math.min(baseDiscounts[selectedAdditionalServices.length] || 20, 20);

        let totalCost = 0;
        selectedAdditionalServices.forEach(service => {
            totalCost += serviceCosts[service] || 0;
        });

        const costBonus = Math.floor(totalCost / 10000) * 0.5;
        discount = Math.min(baseDiscount + costBonus, 20);

        discountPercent.textContent = `-${Math.round(discount)}%`;
        discountSection.style.display = 'block';
    }

    // Event listeners
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            validateName();
            updateSubmitButton();
        });
        nameInput.addEventListener('blur', validateName);
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);

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
        carInput.addEventListener('input', () => {
            validateCar();
            updateSubmitButton();
        });
        carInput.addEventListener('blur', validateCar);
    }

    additionalOptions.forEach(option => {
        option.addEventListener('click', function () {
            const service = this.dataset.option;
            if (selectedAdditionalServices.includes(service)) {
                selectedAdditionalServices = selectedAdditionalServices.filter(s => s !== service);
                this.classList.remove('additional-option--selected');
            } else {
                selectedAdditionalServices.push(service);
                this.classList.add('additional-option--selected');
            }
            calculateDiscount();
        });
    });

    // Form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const isNameValid = validateName();
        const isPhoneValid = validatePhone();
        const isCarValid = validateCar();

        if (isNameValid && isPhoneValid && isCarValid && selectedMainService) {
            submitBtn.textContent = 'Отправляем...';
            submitBtn.disabled = true;

            const payload = {
                name: nameInput.value,
                phone: phoneInput.value,
                carModel: carInput.value,
                mainService: selectedMainService,
                additionalServices: selectedAdditionalServices,
                discount: Math.round(discount),
                source: 'WEBSITE'
            };

            try {
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // Show success popup
                    if (successPopup) {
                        successPopup.classList.add('active');
                    } else {
                        alert('Спасибо за заявку! Мы свяжемся с вами в течение 15 минут.');
                    }

                    // Яндекс Метрика - цель "Успешная отправка формы"
                    if (typeof ym === 'function') {
                        ym(106816930, 'reachGoal', 'form_success');
                    }

                    // Reset form
                    form.reset();
                    additionalOptions.forEach(opt => opt.classList.remove('additional-option--selected'));
                    selectedAdditionalServices = [];
                    discount = 0;
                    if (discountSection) discountSection.style.display = 'none';
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Произошла ошибка при отправке. Пожалуйста, попробуйте позже или позвоните нам.');
            } finally {
                submitBtn.textContent = 'Отправить заявку';
                updateSubmitButton();
            }
        }
    });

    // Close success popup
    if (successClose) {
        successClose.addEventListener('click', () => {
            successPopup.classList.remove('active');
        });
    }
    if (successBtn) {
        successBtn.addEventListener('click', () => {
            successPopup.classList.remove('active');
        });
    }
    if (successPopup) {
        successPopup.addEventListener('click', (e) => {
            if (e.target === successPopup) {
                successPopup.classList.remove('active');
            }
        });
    }

    // Initialize form state
    updateSubmitButton();
});
