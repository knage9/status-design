// Discount Popup Functionality (for main page services form)
document.addEventListener('DOMContentLoaded', function () {
    // Services form elements
    const mainOptions = document.querySelectorAll('.main-option');
    const additionalOptions = document.querySelectorAll('.additional-option');
    const ctaButton = document.querySelector('.services__cta');

    // Discount popup elements
    const discountPopupOverlay = document.getElementById('discountPopupOverlay');
    const discountPopupClose = document.getElementById('discountPopupClose');
    const discountSubmitBtn = document.getElementById('discountSubmitBtn');

    // Discount popup form elements
    const discountUserName = document.getElementById('discountUserName');
    const discountUserPhone = document.getElementById('discountUserPhone');
    const discountCarModel = document.getElementById('discountCarModel');

    // Check if discount popup elements exist before adding event listeners
    if (!discountPopupOverlay || !discountPopupClose || !discountSubmitBtn ||
        !discountUserName || !discountUserPhone || !discountCarModel) {
        return; // Discount popup elements not found on this page, exit silently
    }

    // Discount display elements
    const discountTitle = document.getElementById('discountTitle');

    // Error elements
    const discountNameError = document.getElementById('discountNameError');
    const discountPhoneError = document.getElementById('discountPhoneError');
    const discountCarError = document.getElementById('discountCarError');

    // State variables
    let selectedMainService = '';
    let selectedAdditionalServices = [];
    let discountPopupData = {};

    // Phone number validation regex (Russia format)
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

    // Service costs for discount calculation
    const serviceCosts = {
        'carbon': 80000,           // Карбон
        'antichrome': 60000,       // Антихром с покраской
        'antigravity-film': 50000, // Оклейка антигравийной пленкой
        'disk-painting': 30000,    // Окрас колесных дисков
        'cleaning': 15000,         // Химчистка
        'ceramic': 25000,          // Керамика
        'polish': 10000            // Полировка
    };

    // Enhanced discount calculation based on selected services
    function calculateDiscount() {
        if (selectedAdditionalServices.length === 0 && !selectedMainService) {
            return 0;
        }

        let totalCost = 0;

        // Add main service cost
        if (selectedMainService && serviceCosts[selectedMainService]) {
            totalCost += serviceCosts[selectedMainService];
        }

        // Add additional services cost
        selectedAdditionalServices.forEach(service => {
            if (serviceCosts[service]) {
                totalCost += serviceCosts[service];
            }
        });

        if (totalCost === 0) return 0;

        // Base discount based on quantity of services
        const totalServices = (selectedMainService ? 1 : 0) + selectedAdditionalServices.length;
        const baseDiscounts = [0, 2, 4, 8, 12, 16, 20];
        const baseDiscount = Math.min(baseDiscounts[totalServices] || 20, 20);

        // Additional discount based on total cost (0.5% for every 10,000 rubles)
        const costBonus = Math.floor(totalCost / 10000) * 0.5;

        // Total discount (max 25%)
        const totalDiscount = Math.min(baseDiscount + costBonus, 25);

        return Math.round(totalDiscount);
    }

    // Update CTA button state
    function updateCTAButton() {
        if (ctaButton) {
            const hasSelection = selectedMainService || selectedAdditionalServices.length > 0;
            ctaButton.disabled = !hasSelection;
        }
    }

    // Main service selection
    mainOptions.forEach(option => {
        option.addEventListener('click', function () {
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
        option.addEventListener('click', function () {
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

            updateCTAButton();
        });
    });

    // Open discount popup
    function openDiscountPopup() {
        const discount = calculateDiscount();

        if (discount > 0) {
            // Update popup title with discount
            discountTitle.textContent = `Ваша персональная скидка — ${discount}%`;

            // Show popup
            discountPopupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Focus on first input
            setTimeout(() => {
                discountUserName.focus();
            }, 300);
        }
    }

    // Close discount popup
    function closeDiscountPopup() {
        discountPopupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Show success popup
    function showSuccessPopup() {
        const successPopupOverlay = document.getElementById('successPopupOverlay');
        const successPopupClose = document.getElementById('successPopupClose');
        const successBtn = document.getElementById('discountSuccessBtn');

        if (successPopupOverlay) {
            // Show success popup
            successPopupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Close success popup function
            function closeSuccessPopup() {
                successPopupOverlay.classList.remove('active');
                document.body.style.overflow = '';
                // Reset main page form after closing success popup
                resetMainPageForm();
            }

            // Remove existing event listeners to prevent duplicates
            if (successPopupClose) {
                successPopupClose.removeEventListener('click', closeSuccessPopup);
                successPopupClose.addEventListener('click', closeSuccessPopup);
            }

            if (successBtn) {
                successBtn.removeEventListener('click', closeSuccessPopup);
                successBtn.addEventListener('click', closeSuccessPopup);
            }

            // Close on overlay click
            successPopupOverlay.removeEventListener('click', handleSuccessOverlayClick);
            successPopupOverlay.addEventListener('click', handleSuccessOverlayClick);

            // Close on Escape key
            document.removeEventListener('keydown', handleSuccessEscapeKey);
            document.addEventListener('keydown', handleSuccessEscapeKey);
        }
    }

    // Handle success popup overlay click
    function handleSuccessOverlayClick(e) {
        const successPopupOverlay = document.getElementById('successPopupOverlay');
        if (e.target === successPopupOverlay) {
            successPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
            resetMainPageForm();
        }
    }

    // Handle success popup escape key
    function handleSuccessEscapeKey(e) {
        const successPopupOverlay = document.getElementById('successPopupOverlay');
        if (e.key === 'Escape' && successPopupOverlay && successPopupOverlay.classList.contains('active')) {
            successPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
            resetMainPageForm();
            document.removeEventListener('keydown', handleSuccessEscapeKey);
        }
    }

    // Reset main page form
    function resetMainPageForm() {
        // Reset main service selection
        selectedMainService = '';
        mainOptions.forEach(opt => opt.classList.remove('main-option--active'));

        // Reset additional services selection
        selectedAdditionalServices = [];
        additionalOptions.forEach(opt => opt.classList.remove('additional-option--selected'));

        // Update CTA button state
        updateCTAButton();

        // Clear discount popup form if it's open
        if (discountUserName && discountUserPhone && discountCarModel) {
            discountUserName.value = '';
            discountUserPhone.value = '';
            discountCarModel.value = '';

            // Clear errors
            if (discountNameError) discountNameError.classList.remove('active');
            if (discountPhoneError) discountPhoneError.classList.remove('active');
            if (discountCarError) discountCarError.classList.remove('active');
        }
    }

    // Validation functions
    function validateDiscountName() {
        const name = discountUserName.value.trim();
        if (name.length < 2) {
            discountNameError.textContent = 'Имя должно содержать минимум 2 символа';
            discountNameError.classList.add('active');
            return false;
        }
        discountNameError.classList.remove('active');
        return true;
    }

    function validateDiscountPhone() {
        const phone = discountUserPhone.value.trim();
        if (!phoneRegex.test(phone)) {
            discountPhoneError.textContent = 'Введите корректный номер телефона';
            discountPhoneError.classList.add('active');
            return false;
        }
        discountPhoneError.classList.remove('active');
        return true;
    }

    function validateDiscountCarModel() {
        const car = discountCarModel.value.trim();
        if (car.length < 3) {
            discountCarError.textContent = 'Укажите марку и модель автомобиля';
            discountCarError.classList.add('active');
            return false;
        }
        discountCarError.classList.remove('active');
        return true;
    }

    // Phone number formatting
    discountUserPhone.addEventListener('input', function (e) {
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
        validateDiscountPhone();
    });

    // Real-time validation
    discountUserName.addEventListener('input', validateDiscountName);
    discountUserPhone.addEventListener('input', validateDiscountPhone);
    discountCarModel.addEventListener('input', validateDiscountCarModel);

    // CTA button click handler
    if (ctaButton) {
        ctaButton.addEventListener('click', function (e) {
            e.preventDefault();

            if (!ctaButton.disabled) {
                openDiscountPopup();
            }
        });
    }

    // Discount popup submit
    if (discountSubmitBtn) {
        discountSubmitBtn.addEventListener('click', function () {
            // Validate all fields
            const isNameValid = validateDiscountName();
            const isPhoneValid = validateDiscountPhone();
            const isCarValid = validateDiscountCarModel();

            if (!isNameValid || !isPhoneValid || !isCarValid) {
                return;
            }

            // Show loading state
            discountSubmitBtn.classList.add('loading');
            discountSubmitBtn.textContent = 'Отправляем...';
            discountSubmitBtn.disabled = true;

            // Prepare form data
            discountPopupData = {
                name: discountUserName.value.trim(),
                phone: discountUserPhone.value.trim(),
                carModel: discountCarModel.value.trim(),
                mainService: selectedMainService,
                additionalServices: [...selectedAdditionalServices],
                discount: calculateDiscount(),
                timestamp: new Date().toISOString()
            };

            console.log('Discount popup data to send to CRM:', discountPopupData);

            // Send data to CRM immediately
            sendDiscountToCRM(discountPopupData);

            // Show success after a short delay
            setTimeout(() => {
                // Close discount popup
                closeDiscountPopup();

                // Show success popup
                showSuccessPopup();

                // Reset loading state
                discountSubmitBtn.classList.remove('loading');
                discountSubmitBtn.textContent = 'Отправить заявку';
                discountSubmitBtn.disabled = false;
            }, 1500);
        });
    }

    // Close popup events
    if (discountPopupClose) {
        discountPopupClose.addEventListener('click', closeDiscountPopup);
    }

    if (discountPopupOverlay) {
        discountPopupOverlay.addEventListener('click', function (e) {
            if (e.target === discountPopupOverlay) {
                closeDiscountPopup();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && discountPopupOverlay && discountPopupOverlay.classList.contains('active')) {
            closeDiscountPopup();
        }
    });

    // Handle success popup overlay click
    function handleSuccessOverlayClick(e) {
        const successPopupOverlay = document.getElementById('successPopupOverlay');
        if (e.target === successPopupOverlay) {
            successPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
            resetMainPageForm();
        }
    }

    // Handle success popup escape key
    function handleSuccessEscapeKey(e) {
        const successPopupOverlay = document.getElementById('successPopupOverlay');
        if (e.key === 'Escape' && successPopupOverlay && successPopupOverlay.classList.contains('active')) {
            successPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
            resetMainPageForm();
            document.removeEventListener('keydown', handleSuccessEscapeKey);
        }
    }



    // Function to send data to CRM
    function sendDiscountToCRM(data) {
        const webhookUrl = 'https://app.sbercrm.com/react-gateway/api/webhook/9c5fc3c2-1761-43a8-980a-21c18f85476e';

        // CRM Dictionary Mappings
        const mainServiceMap = {
            'carbon': 'karbon',
            'antichrome': 'antikhrom'
        };

        const additionalServiceMap = {
            'ceramic': 'keramika',
            'antigravity-film': 'oklejka_antigravijnoj_plenkoj',
            'film': 'oklejka_antigravijnoj_plenkoj', // index.html uses 'film'
            'disk-painting': 'okras_kolesnykh_diskov',
            'disks': 'okras_kolesnykh_diskov', // index.html uses 'disks'
            'polish': 'polirovka',
            'cleaning': 'khimchistka'
        };

        // Map values
        const mappedMainService = mainServiceMap[data.mainService] || data.mainService;
        const mappedAdditionalServices = data.additionalServices.map(service => additionalServiceMap[service] || service);

        // Map data to CRM fields
        const crmData = {
            "name": `Заявка от ${data.name}`, // Required field "Заявка"
            "userName$c": data.name,
            "userPhone$c": data.phone,
            "car_model$c": data.carModel,
            "main_service$c": mappedMainService,
            "additional_services$c": mappedAdditionalServices.join(','), // Send as String
            "discount$c": data.discount
        };

        console.log('Sending discount form to CRM:', crmData);

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(crmData)
        })
            .then(response => {
                if (response.ok) {
                    console.log('CRM request successful');
                } else {
                    console.error('CRM request failed', response.statusText);
                    response.text().then(text => console.error('CRM Error Details:', text));
                }
            })
            .catch(error => {
                console.error('CRM error:', error);
            })
            .finally(() => {
                // Reset loading state
                discountSubmitBtn.classList.remove('loading');
                discountSubmitBtn.textContent = 'Отправить заявку';
                discountSubmitBtn.disabled = false;
            });

        // Send to backend API (non-blocking)
        fetch('/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                phone: data.phone,
                carModel: data.carModel,
                mainService: data.mainService,
                additionalServices: data.additionalServices,
                discount: data.discount,
                source: 'DISCOUNT_POPUP'
            })
        })
            .then(response => {
                if (response.ok) {
                    console.log('Backend save successful');
                } else {
                    console.error('Backend save failed', response.statusText);
                }
            })
            .catch(error => {
                console.error('Backend save error:', error);
            });
    }

    // Initialize button state
    updateCTAButton();
});
