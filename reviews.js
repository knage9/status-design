// Reviews Page JavaScript

class ReviewsManager {
    constructor() {
        this.reviews = [];
        this.filteredReviews = [];
        this.displayedCount = 6;
        this.currentSort = 'default';
        this.currentServiceFilter = 'all';

        // Review Popup State
        this.currentStep_review = 1;
        this.selectedServices = [];
        this.reviewData = {
            carModel: '',
            reviewText: '',
            photos: []
        };

        this.init();
    }

    init() {
        this.loadReviews();
        this.bindEvents();
    }

    // Обновление активных кнопок фильтров
    updateActiveFilterButtons() {
        // Устанавливаем активную кнопку сортировки
        const sortOptions = document.querySelectorAll('#sortMenu .filter-dropdown__option');
        sortOptions.forEach(option => {
            option.classList.remove('filter-dropdown__option--active');
            if (option.dataset.value === this.currentSort) {
                option.classList.add('filter-dropdown__option--active');
            }
        });

        // Обновляем текст кнопки сортировки
        const activeSortOption = document.querySelector(`#sortMenu .filter-dropdown__option[data-value="${this.currentSort}"]`);
        if (activeSortOption) {
            document.querySelector('.filter-dropdown__text').textContent = activeSortOption.textContent;
        }

        // Устанавливаем активную кнопку фильтра услуг
        const serviceOptions = document.querySelectorAll('#servicesMenu .filter-dropdown__option');
        serviceOptions.forEach(option => {
            option.classList.remove('filter-dropdown__option--active');
            if (option.dataset.value === this.currentServiceFilter) {
                option.classList.add('filter-dropdown__option--active');
            }
        });
    }

    // Привязка событий
    bindEvents() {
        // Привязываем события для попапа отзывов
        this.bindReviewPopupEvents();

        // Фильтры сортировки
        const sortToggle = document.getElementById('sortToggle');
        const sortMenu = document.getElementById('sortMenu');

        if (sortToggle && sortMenu) {
            sortToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sortMenu.classList.toggle('active');
            });

            sortMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-dropdown__option')) {
                    this.currentSort = e.target.dataset.value;
                    const sortText = sortToggle.querySelector('.filter-dropdown__text');
                    if (sortText) sortText.textContent = e.target.textContent;
                    sortMenu.classList.remove('active');
                    this.applyFilters();
                }
            });
        }

        // Фильтры услуг
        const serviceToggle = document.getElementById('servicesToggle');
        const serviceMenu = document.getElementById('servicesMenu');

        if (serviceToggle && serviceMenu) {
            serviceToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                serviceMenu.classList.toggle('active');
            });

            serviceMenu.addEventListener('click', (e) => {
                const option = e.target.closest('.filter-dropdown__option');
                if (!option) return;

                this.currentServiceFilter = option.dataset.value;
                // если хочешь текст на кнопке – можно сделать отдельный span
                serviceMenu.classList.remove('active');
                this.applyFilters();
            });
        }


        // Кнопка "Показать еще"
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.displayedCount += 6;
                this.renderReviews();
            });
        }

        // Закрытие дропдаунов при клике вне их
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                document.querySelectorAll('.filter-dropdown__menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }


    // Применение фильтров
    applyFilters() {
        let filtered = [...this.reviews];

        // Фильтрация по услугам
        if (this.currentServiceFilter !== 'all') {
            filtered = filtered.filter(review =>
                Array.isArray(review.servicesSelected) &&
                review.servicesSelected.includes(this.currentServiceFilter)
            );
        }


        // Положительные / отрицательные
        if (this.currentSort === 'positive') {
            filtered = filtered.filter(r => r.rating >= 4); // можно 4–5
        } else if (this.currentSort === 'negative') {
            filtered = filtered.filter(r => r.rating <= 2); // можно 1–2
        }

        // Сортировка
        switch (this.currentSort) {
            case 'date':
                // по дате (если хочешь явную сортировку по дате)
                filtered.sort((a, b) => {
                    // если date у тебя сейчас строка ru-RU, лучше хранить исходную дату в объекте
                    return new Date(b.rawDate) - new Date(a.rawDate);
                });
                break;
            case 'default':
            case 'positive':
            case 'negative':
            default:
                // дефолтный порядок (как пришли с API, если API уже по дате)
                break;
        }

        this.filteredReviews = filtered;
        this.displayedCount = 6;
        this.renderReviews();
        this.updateActiveFilterButtons();
    }


    // Отрисовка отзывов
    renderReviews() {
        const grid = document.getElementById('reviewsGrid');
        if (!grid) return;

        const reviewsToShow = this.filteredReviews.slice(0, this.displayedCount);
        grid.innerHTML = '';

        if (reviewsToShow.length === 0) {
            grid.innerHTML = '<div class="no-reviews">Отзывы не найдены</div>';
            return;
        }

        reviewsToShow.forEach(review => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = this.createReviewCard(review);
            grid.appendChild(cardElement.firstElementChild);
        });

        // Показываем/скрываем кнопку "Показать еще"
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            showMoreBtn.style.display = this.displayedCount < this.filteredReviews.length ? 'flex' : 'none';
        }
    }

    // Загрузка отзывов с API
    async loadReviews() {
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();

            this.reviews = data.map(review => ({
                id: review.id,
                rating: review.rating,
                // service: review.service, // можно убрать, если такого поля нет
                servicesSelected: review.servicesSelected || [], // <-- массив услуг из админки
                carModel: `${review.carBrand} ${review.carModel}`,
                text: review.text,
                date: new Date(review.datePublished || review.dateCreated).toLocaleDateString('ru-RU'),
                hasImage: review.images && review.images.length > 0,
                image: review.images && review.images.length > 0 ? review.images[0] : null,
                tags: review.tags || []
            }));

            this.filteredReviews = [...this.reviews];
            this.applyFilters();
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    // Создание HTML карточки отзыва
    createReviewCard(review) {
        const starsHtml = Array(5).fill(0).map((_, i) =>
            `<img src="${i < review.rating ? 'img/black-star.svg' : 'img/star-zero.svg'}" alt="Star">`
        ).join('');

        const imageHtml = review.hasImage ?
            `<div class="review-card-reviews__image">
                <img src="${review.image}" alt="Фото результата">
            </div>` : '';

        const tagsHtml = review.tags.map(tag =>
            `<span class="review-card-reviews__tag">${tag}</span>`
        ).join('');

        return `
            <div class="review-card-container" data-id="${review.id}">
                <div class="review-card-reviews">
                    <div class="review-card-reviews__header">
                        <div class="review-card-reviews__stars">
                            ${starsHtml}
                        </div>
                        <div class="review-card-reviews__date">${review.date}</div>
                    </div>
                    <p class="review-card-reviews__text">${review.text}</p>
                    ${imageHtml}
                </div>
                <div class="review-card-below-tags">
                    ${tagsHtml}
                </div>
            </div>
        `;
    }

    // ...



    async submitReview() {
        if (!this.validateStep(3)) return;

        const carModelInput = document.getElementById('reviewCarModel');
        const textInput = document.getElementById('reviewText');
        const ratingInput = document.getElementById('reviewRating');

        // Split car model into brand and model (simple heuristic)
        const carInputValue = carModelInput.value.trim();
        const firstSpaceIndex = carInputValue.indexOf(' ');
        let carBrand = carInputValue;
        let carModel = '';

        if (firstSpaceIndex > 0) {
            carBrand = carInputValue.substring(0, firstSpaceIndex);
            carModel = carInputValue.substring(firstSpaceIndex + 1);
        }

        const reviewData = {
            rating: parseInt(ratingInput.value) || 5,
            carBrand: carBrand,
            carModel: carModel || 'Unknown',
            service: this.selectedServices?.[0] || 'website',
            text: textInput.value,
            servicesSelected: this.selectedServices,
            status: 'PENDING',
            tags: []
        };

        try {
            // 1. Upload images if any
            if (this.uploadedFiles && this.uploadedFiles.length > 0) {
                const uploadPromises = this.uploadedFiles.map(file => {
                    const fd = new FormData();
                    fd.append('file', file);
                    return fetch('/api/uploads/images', {
                        method: 'POST',
                        body: fd
                    }).then(res => res.json());
                });

                const uploadResults = await Promise.all(uploadPromises);
                reviewData.images = uploadResults.map(res => res.url);
            } else {
                reviewData.images = [];
            }

            // 2. Submit Review (публичный endpoint без авторизации)
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) throw new Error('Failed to submit review');

            // Show success message and move to final step
            this.showNotification('Отзыв успешно отправлен на модерацию!');
            // Show success message and move to final step
            this.showNotification('Отзыв успешно отправлен на модерацию!');
            this.currentStep_review = 4;
            this.updatePopupStep();

        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Ошибка при отправке отзыва');
        }
    }

    handleReviewPhotoUpload(e) {
        const files = Array.from(e.target.files);
        if (!this.uploadedFiles) this.uploadedFiles = [];

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.uploadedFiles.push(file);

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.addReviewPhotoPreview(e.target.result, file.name);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    addReviewPhotoPreview(src, fileName) {
        const previewContainer = document.getElementById('reviewPhotoPreview');
        if (!previewContainer) return;

        const previewItem = document.createElement('div');
        previewItem.className = 'photo-upload__preview-item';

        previewItem.innerHTML = `
            <img src="${src}" alt="${fileName}">
            <button type="button" class="photo-upload__preview-remove">
                <img src="img/close.svg" alt="Remove">
            </button>
        `;

        const removeBtn = previewItem.querySelector('.photo-upload__preview-remove');
        removeBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent bubbling
            const index = Array.from(previewContainer.children).indexOf(previewItem);
            if (this.uploadedFiles && index >= 0) {
                this.uploadedFiles.splice(index, 1);
            }
            previewItem.remove();
        };

        previewContainer.appendChild(previewItem);
    }

    // ...

    getServiceName(service) {
        const services = {
            antichrome: 'Антихром',
            carbon: 'Карбон',
            soundproofing: 'Шумоизоляция',
            wheels: 'Колесные диски',
            cleaning: 'Химчистка',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Покраска дисков',
            'ceramic': 'Керамика',
            'polish': 'Полировка',
            other: 'Другое'
        };
        return services[service] || service;
    }

    // Обработка загрузки фото
    handlePhotoUpload(e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('photoPreview');

        if (!preview) return;

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'photo-upload__preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <div class="photo-upload__preview-remove">
                            <img src="img/close.svg" alt="Remove">
                        </div>
                    `;

                    // Обработка удаления фото
                    const removeBtn = previewItem.querySelector('.photo-upload__preview-remove');
                    removeBtn.addEventListener('click', () => {
                        previewItem.remove();
                        this.removeUploadedPhoto(e.target.result);
                    });

                    preview.appendChild(previewItem);
                    this.addUploadedPhoto(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Управление загруженными фото
    addUploadedPhoto(photo) {
        if (!this.uploadedPhotos) {
            this.uploadedPhotos = [];
        }
        this.uploadedPhotos.push(photo);
    }

    removeUploadedPhoto(photo) {
        if (this.uploadedPhotos) {
            this.uploadedPhotos = this.uploadedPhotos.filter(p => p !== photo);
        }
    }

    clearPhotoPreview() {
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.innerHTML = '';
        }
        this.uploadedPhotos = [];
    }

    // Показ уведомлений
    showNotification(message, type = 'success') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        // Добавляем стили для уведомления
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            backgroundColor: type === 'success' ? '#1458E4' : '#ff4444',
            color: '#ffffff',
            borderRadius: '10px',
            zIndex: '10001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif'
        });

        document.body.appendChild(notification);

        // Показываем уведомление
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Скрываем уведомление
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Review Popup Methods
    bindReviewPopupEvents() {
        // Кнопка "Оставить отзыв"
        const leaveBtn = document.querySelector('.reviews-page__leave-btn');
        leaveBtn?.addEventListener('click', () => {
            this.openReviewPopup();
        });

        // Кнопка закрытия попапа
        const closeBtn = document.getElementById('reviewPopupClose');
        closeBtn?.addEventListener('click', () => {
            this.closeReviewPopup();
        });

        // Клик вне попапа для закрытия
        const popup = document.getElementById('reviewPopupOverlay');
        popup?.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closeReviewPopup();
            }
        });

        // Кнопка "Продолжить"
        const continueBtn = document.getElementById('reviewContinueBtn');
        continueBtn?.addEventListener('click', () => {
            this.nextStep();
        });

        // Кнопка "Отправить отзыв"
        const submitBtn = document.getElementById('reviewSubmitBtn');
        submitBtn?.addEventListener('click', () => {
            this.submitReview();
        });

        // Кнопка "Отлично" (финальный шаг)
        const successBtn = document.getElementById('reviewSuccessBtn');
        successBtn?.addEventListener('click', () => {
            this.closeReviewPopup();
        });

        // Обработка выбора услуг
        const serviceButtons = document.querySelectorAll('.popup__additional-btn');
        serviceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectService(e.target.dataset.service, e.target);
            });
        });

        // Обработка загрузки фото в попапе
        const photoInput = document.getElementById('reviewPhotoInput');
        photoInput?.addEventListener('change', (e) => {
            this.handleReviewPhotoUpload(e);
        });

        // Interactive Stars Logic
        const starsContainer = document.getElementById('reviewRatingStars');
        if (starsContainer) {
            const stars = starsContainer.querySelectorAll('img');
            const ratingInput = document.getElementById('reviewRating');

            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const rating = index + 1;
                    ratingInput.value = rating;
                    this.updateStars(rating);
                    // Скрываем ошибку при выборе рейтинга
                    this.hidePopupError('reviewRatingError');
                });

                star.addEventListener('mouseenter', () => {
                    this.updateStars(index + 1, true);
                });
            });

            starsContainer.addEventListener('mouseleave', () => {
                const currentRating = parseInt(ratingInput.value) || 0;
                this.updateStars(currentRating);
            });
        }
    }

    updateStars(rating, isHover = false) {
        const stars = document.querySelectorAll('#reviewRatingStars img');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.src = 'img/black-star.svg';
            } else {
                star.src = 'img/star-zero.svg';
            }
        });
    }

    openReviewPopup() {
        const popup = document.getElementById('reviewPopupOverlay');
        if (popup) {
            this.currentStep_review = 1;
            this.selectedServices = [];
            this.resetReviewPopup();
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeReviewPopup() {
        const popup = document.getElementById('reviewPopupOverlay');
        if (popup) {
            popup.classList.remove('active');
            document.body.style.overflow = '';
            this.resetReviewPopup();
        }
    }

    nextStep() {
        if (this.validateStep(this.currentStep_review)) {
            this.currentStep_review++;
            this.updatePopupStep();
        }
    }

    updatePopupStep() {
        // Обновляем активный шаг
        document.querySelectorAll('.popup__step-review').forEach((step_review, index) => {
            step_review.classList.toggle('popup__step-review--active', index + 1 === this.currentStep_review);
        });

        // Обновляем заголовок попапа
        const titleElement = document.getElementById('reviewPopupTitle');
        if (titleElement) {
            switch (this.currentStep_review) {
                case 1:
                    titleElement.textContent = 'Оставь отзыв — сделаем сервис лучше вместе';
                    break;
                case 2:
                    titleElement.textContent = 'Оцените результат нашей работы';
                    break;
                case 3:
                    titleElement.textContent = 'Укажите, какие работы мы выполнили для вас';
                    break;
                case 4:
                    titleElement.textContent = 'Готово! Отзыв скоро появится после модерации.';
                    break;
            }
        }

        // Обновляем кнопки
        const continueBtn = document.getElementById('reviewContinueBtn');
        const submitBtn = document.getElementById('reviewSubmitBtn');
        const successBtn = document.getElementById('reviewSuccessBtn');

        if (continueBtn) continueBtn.style.display = this.currentStep_review < 3 ? 'flex' : 'none';
        if (submitBtn) submitBtn.style.display = this.currentStep_review === 3 ? 'flex' : 'none';
        if (successBtn) successBtn.style.display = this.currentStep_review === 4 ? 'flex' : 'none';

        // Динамическое управление высотой попапа
        this.updatePopupHeight();
    }

    updatePopupHeight() {
        const popupOverlay = document.getElementById('reviewPopupOverlay'); // именно review-попап
        if (!popupOverlay) return;

        const popup = popupOverlay.querySelector('.popup');
        if (!popup) return;

        let targetHeight;
        const isMobile = window.innerWidth <= 768;

        switch (this.currentStep_review) {
            case 1:
                targetHeight = isMobile ? '500px' : '600px';
                break;
            case 2:
                targetHeight = isMobile ? '300px' : '400px';
                break;
            case 3:
                targetHeight = isMobile ? '500px' : '700px';
                break;
            case 4:
                targetHeight = isMobile ? '300px' : '300px';
                break;
            default:
                targetHeight = isMobile ? '500px' : '700px';
        }

        popup.style.height = targetHeight;
        this.centerPopup(popup); // лучше явно передать элемент
    }


    centerPopup() {
        const popup = document.querySelector('.popup');
        if (!popup) return;

        // Убеждаемся, что попап остается центрированным
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.position = 'fixed';
    }

    validateStep(step_review) {
        switch (step_review) {
            case 1:
                const carModel = document.getElementById('reviewCarModel').value.trim();
                const reviewText = document.getElementById('reviewText').value.trim();

                if (!carModel) {
                    this.showPopupError('reviewCarError', 'Укажите марку и модель авто');
                    return false;
                }

                if (!reviewText) {
                    this.showPopupError('reviewTextError', 'Напишите ваш отзыв');
                    return false;
                }

                // Сохраняем данные
                this.reviewData.carModel = carModel;
                this.reviewData.reviewText = reviewText;

                return true;

            case 2:
                const rating = parseInt(document.getElementById('reviewRating').value);
                if (rating === 0) {
                    this.showPopupError('reviewRatingError', 'Пожалуйста, выберите рейтинг');
                    return false;
                }
                return true;

            case 3:
                if (this.selectedServices.length === 0) {
                    this.showPopupError('reviewServiceError', 'Выберите хотя бы одну услугу');
                    return false;
                }
                return true;

            default:
                return true;
        }
    }

    selectService(service, button) {
        // Переключаем выбор услуги
        if (this.selectedServices.includes(service)) {
            this.selectedServices = this.selectedServices.filter(s => s !== service);
            button.classList.remove('popup__additional-btn--selected');
        } else {
            this.selectedServices.push(service);
            button.classList.add('popup__additional-btn--selected');
        }

        // Скрываем ошибку при выборе услуги
        this.hidePopupError('reviewServiceError');
    }





    showPopupError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
        }
    }

    hidePopupError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.remove('active');
        }
    }

    resetReviewPopup() {
        // Сбрасываем состояние попапа
        this.currentStep_review = 1;
        this.selectedServices = [];
        this.uploadedFiles = []; // Clear uploaded files
        this.reviewData = {
            carModel: '',
            reviewText: '',
            photos: []
        };

        // Сбрасываем формы
        const carModelInput = document.getElementById('reviewCarModel');
        const reviewTextInput = document.getElementById('reviewText');
        const ratingInput = document.getElementById('reviewRating');
        const photoPreview = document.getElementById('reviewPhotoPreview');

        if (carModelInput) carModelInput.value = '';
        if (reviewTextInput) reviewTextInput.value = '';
        if (ratingInput) ratingInput.value = '0';
        if (photoPreview) photoPreview.innerHTML = '';

        // Reset star rating display
        this.updateStars(0);

        // Снимаем выбор со всех услуг
        document.querySelectorAll('.popup__additional-btn').forEach(btn => {
            btn.classList.remove('popup__additional-btn--selected');
        });

        // Скрываем все ошибки
        document.querySelectorAll('.popup__error').forEach(error => {
            error.classList.remove('active');
        });

        // Обновляем попап
        this.updatePopupStep();
    }

    // Обработка изменения размера окна
    handleWindowResize() {
        // Если попап активен, обновляем его высоту
        const popup = document.getElementById('reviewPopupOverlay');
        if (popup && popup.classList.contains('active')) {
            this.updatePopupHeight();
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ReviewsManager();
});
