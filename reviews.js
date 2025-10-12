// Reviews Page JavaScript

class ReviewsManager {
    constructor() {
        this.reviews = [];
        this.filteredReviews = [];
        this.displayedCount = 6;
        this.currentSort = 'default';
        this.currentServiceFilter = 'all';

        this.init();
    }

    init() {
        this.generateReviews();
        this.bindEvents();
        this.applyFilters(); // Применяем фильтры при инициализации
        this.updateActiveFilterButtons(); // Обновляем активные кнопки фильтров
        this.renderReviews();
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

    // Генерация разнообразных отзывов
    generateReviews() {
        const reviewsData = [
            {
                id: 1,
                rating: 5,
                service: 'antichrome',
                carModel: 'BMW X5',
                text: 'Отличная работа по антихрому! Машина выглядит намного солиднее и современнее. Ребята профессионалы своего дела, все сделали быстро и качественно.',
                date: '15.10.2024',
                hasImage: true,
                image: 'img/review-1.png',
                tags: ['BMW X5', 'Антихром']
            },
            {
                id: 2,
                rating: 5,
                service: 'carbon',
                carModel: 'Mercedes GLS',
                text: 'Заказывал карбоновые детали для GLS Майбах. Результат превзошел все ожидания! Качество материалов на высшем уровне, установка идеальная.',
                date: '12.10.2024',
                hasImage: true,
                image: 'img/review-2.png',
                tags: ['GLS Майбах', 'Карбон']
            },
            {
                id: 3,
                rating: 4,
                service: 'soundproofing',
                carModel: 'Audi Q7',
                text: 'Шумоизоляция сделана на совесть. В салоне стало значительно тише, особенно на трассе. Рекомендую всем, кто ценит комфорт.',
                date: '10.10.2024',
                hasImage: false,
                tags: ['Audi Q7', 'Шумоизоляция']
            },
            {
                id: 4,
                rating: 5,
                service: 'wheels',
                carModel: 'Porsche Cayenne',
                text: 'Покраска колесных дисков в черный матовый цвет преобразила весь внешний вид автомобиля. Теперь машина выглядит агрессивно и стильно.',
                date: '08.10.2024',
                hasImage: true,
                image: 'img/review-3.png',
                tags: ['Porsche Cayenne', 'Колесные диски']
            },
            {
                id: 5,
                rating: 5,
                service: 'cleaning',
                carModel: 'Range Rover',
                text: 'Химчистка салона выполнена на высшем уровне. Кожа выглядит как новая, все пятна удалены, запах свежести. Мастера - настоящие профессионалы!',
                date: '05.10.2024',
                hasImage: false,
                tags: ['Range Rover', 'Химчистка']
            },
            {
                id: 6,
                rating: 4,
                service: 'antichrome',
                carModel: 'Toyota Land Cruiser',
                text: 'Антихром отлично освежил внешний вид моего Крузака. Хромированные элементы были слишком вычурными, теперь машина выглядит более мужественно.',
                date: '03.10.2024',
                hasImage: true,
                image: 'img/Gallery-1.png',
                tags: ['Land Cruiser', 'Антихром']
            },
            {
                id: 7,
                rating: 5,
                service: 'carbon',
                carModel: 'BMW M3',
                text: 'Карбоновый обвес на M3 выглядит просто космос! Легкость, прочность и внешний вид - все на высоте. Монтаж выполнен идеально.',
                date: '01.10.2024',
                hasImage: true,
                image: 'img/Gallery-2.png',
                tags: ['BMW M3', 'Карбон']
            },
            {
                id: 8,
                rating: 5,
                service: 'soundproofing',
                carModel: 'Mercedes S-Class',
                text: 'После шумоизоляции в S-Class стало тише, чем в библиотеке. Можно разговаривать шепотом на любой скорости. Потрясающий результат!',
                date: '28.09.2024',
                hasImage: false,
                tags: ['Mercedes S-Class', 'Шумоизоляция']
            },
            {
                id: 9,
                rating: 4,
                service: 'wheels',
                carModel: 'Audi RS6',
                text: 'Покраска дисков в бронзовый цвет сделала RS6 еще более эксклюзивной. Цвет подобран идеально под оттенок кузова.',
                date: '25.09.2024',
                hasImage: true,
                image: 'img/Gallery-3.png',
                tags: ['Audi RS6', 'Колесные диски']
            },
            {
                id: 10,
                rating: 5,
                service: 'cleaning',
                carModel: 'Bentley Continental',
                text: 'Химчистка салона Bentley выполнена ювелирно. Все материалы выглядят как новые, особое внимание уделили светлой коже.',
                date: '22.09.2024',
                hasImage: false,
                tags: ['Bentley Continental', 'Химчистка']
            },
            {
                id: 11,
                rating: 5,
                service: 'antichrome',
                carModel: 'Lexus LX',
                text: 'Антихром на LX570 - это то, что доктор прописал! Машина сразу стала выглядеть дороже и современнее. Спасибо мастерам!',
                date: '20.09.2024',
                hasImage: true,
                image: 'img/Gallery-4.png',
                tags: ['Lexus LX', 'Антихром']
            },
            {
                id: 12,
                rating: 4,
                service: 'carbon',
                carModel: 'Porsche 911',
                text: 'Карбоновые элементы на 911 добавили спортивности и шарма. Качество исполнения на высшем уровне, все зазоры идеальные.',
                date: '18.09.2024',
                hasImage: true,
                image: 'img/Gallery-5.png',
                tags: ['Porsche 911', 'Карбон']
            },
            {
                id: 13,
                rating: 5,
                service: 'soundproofing',
                carModel: 'BMW 7 Series',
                text: 'Шумоизоляция в семерке BMW - это комфорт высшего класса. Теперь можно наслаждаться тишиной и музыкой даже на высокой скорости.',
                date: '15.09.2024',
                hasImage: false,
                tags: ['BMW 7 Series', 'Шумоизоляция']
            },
            {
                id: 14,
                rating: 5,
                service: 'wheels',
                carModel: 'Mercedes G-Class',
                text: 'Покраска дисков G-Class в черный глянец сделала Гелик еще более брутальным. Отличная работа, рекомендую!',
                date: '12.09.2024',
                hasImage: true,
                image: 'img/news_img_1.png',
                tags: ['Mercedes G-Class', 'Колесные диски']
            },
            {
                id: 15,
                rating: 4,
                service: 'cleaning',
                carModel: 'Rolls-Royce Ghost',
                text: 'Химчистка салона Rolls-Royce требует особого подхода. Мастера справились на отлично, все поверхности выглядят идеально.',
                date: '10.09.2024',
                hasImage: false,
                tags: ['Rolls-Royce Ghost', 'Химчистка']
            }
        ];

        this.reviews = reviewsData;
        this.filteredReviews = [...this.reviews];
    }

    // Привязка событий
    bindEvents() {
        // Фильтры
        const sortToggle = document.getElementById('sortToggle');
        const sortMenu = document.getElementById('sortMenu');
        const servicesToggle = document.getElementById('servicesToggle');
        const servicesMenu = document.getElementById('servicesMenu');

        // Сортировка
        sortToggle?.addEventListener('click', () => {
            this.toggleDropdown(sortMenu, sortToggle);
        });

        sortMenu?.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-dropdown__option')) {
                this.handleSortChange(e.target.dataset.value, e.target);
                this.closeDropdown(sortMenu, sortToggle);
            }
        });

        // Фильтр по услугам
        servicesToggle?.addEventListener('click', () => {
            this.toggleDropdown(servicesMenu, servicesToggle);
        });

        servicesMenu?.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-dropdown__option')) {
                this.handleServiceFilterChange(e.target.dataset.value, e.target);
                this.closeDropdown(servicesMenu, servicesToggle);
            }
        });

        // Кнопка "Показать еще"
        const showMoreBtn = document.getElementById('showMoreBtn');
        showMoreBtn?.addEventListener('click', () => {
            this.showMoreReviews();
        });

        // Модальное окно отзыва
        const leaveBtn = document.querySelector('.reviews-page__leave-btn');
        const modal = document.getElementById('reviewModalOverlay');
        const closeBtn = document.getElementById('reviewModalClose');

        leaveBtn?.addEventListener('click', () => {
            this.openReviewModal();
        });

        closeBtn?.addEventListener('click', () => {
            this.closeReviewModal();
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeReviewModal();
            }
        });

        // Форма отзыва
        const reviewForm = document.getElementById('reviewForm');
        reviewForm?.addEventListener('submit', (e) => {
            this.handleReviewSubmit(e);
        });

        // Загрузка фото
        const photoInput = document.getElementById('photoInput');
        photoInput?.addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Закрытие dropdown при клике вне
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    // Управление dropdown
    toggleDropdown(menu, toggle) {
        const isActive = menu.classList.contains('active');

        this.closeAllDropdowns();

        if (!isActive) {
            menu.classList.add('active');
            toggle.classList.add('active');
        }
    }

    closeDropdown(menu, toggle) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.filter-dropdown__menu');
        const toggles = document.querySelectorAll('.filter-dropdown__toggle');

        dropdowns.forEach(menu => menu.classList.remove('active'));
        toggles.forEach(toggle => toggle.classList.remove('active'));
    }

    // Обработка изменения сортировки
    handleSortChange(value, element) {
        this.currentSort = value;

        // Обновляем активный элемент
        document.querySelectorAll('#sortMenu .filter-dropdown__option').forEach(opt => {
            opt.classList.remove('filter-dropdown__option--active');
        });
        element.classList.add('filter-dropdown__option--active');

        // Обновляем текст кнопки
        const text = element.textContent;
        document.querySelector('.filter-dropdown__text').textContent = text;

        this.applyFilters();
    }

    // Обработка изменения фильтра услуг
    handleServiceFilterChange(value, element) {
        this.currentServiceFilter = value;

        // Обновляем активный элемент
        document.querySelectorAll('#servicesMenu .filter-dropdown__option').forEach(opt => {
            opt.classList.remove('filter-dropdown__option--active');
        });
        element.classList.add('filter-dropdown__option--active');

        this.applyFilters();
    }

    // Применение фильтров
    applyFilters() {
        let filtered = [...this.reviews];

        // Фильтр по услугам
        if (this.currentServiceFilter !== 'all') {
            filtered = filtered.filter(review => review.service === this.currentServiceFilter);
        }

        // Сортировка
        switch (this.currentSort) {
            case 'date':
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'positive':
                filtered = filtered.filter(review => review.rating >= 4);
                filtered.sort((a, b) => b.rating - a.rating); // От 5 к 4 звездам
                break;
            case 'negative':
                filtered = filtered.filter(review => review.rating <= 3);
                filtered.sort((a, b) => a.rating - b.rating); // От 1 к 3 звездам
                break;
            default:
                // По умолчанию: сначала с фото, потом без фото
                filtered.sort((a, b) => {
                    // Если один с фото, другой без - фото идет первым
                    if (a.hasImage && !b.hasImage) return -1;
                    if (!a.hasImage && b.hasImage) return 1;
                    // Если оба с фото или оба без - оставляем исходный порядок
                    return 0;
                });
                break;
        }

        this.filteredReviews = filtered;
        this.displayedCount = 6;
        this.renderReviews();
    }

    // Рендер отзывов
    renderReviews() {
        const grid = document.getElementById('reviewsGrid');
        if (!grid) return;

        const reviewsToShow = this.filteredReviews.slice(0, this.displayedCount);

        grid.innerHTML = reviewsToShow.map(review => this.createReviewCard(review)).join('');

        // Показываем/скрываем кнопку "Показать еще"
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            showMoreBtn.style.display = this.displayedCount < this.filteredReviews.length ? 'flex' : 'none';
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

    // Показать больше отзывов
    showMoreReviews() {
        this.displayedCount += 6;
        this.renderReviews();
    }

    // Модальное окно отзыва
    openReviewModal() {
        const modal = document.getElementById('reviewModalOverlay');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeReviewModal() {
        const modal = document.getElementById('reviewModalOverlay');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.resetReviewForm();
        }
    }

    // Сброс формы отзыва
    resetReviewForm() {
        const form = document.getElementById('reviewForm');
        if (form) {
            form.reset();
            this.clearPhotoPreview();
        }
    }

    // Обработка отправки отзыва
    handleReviewSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const reviewData = {
            rating: parseInt(formData.get('rating')),
            service: formData.get('service'),
            carModel: formData.get('carModel'),
            reviewText: formData.get('reviewText'),
            photos: this.uploadedPhotos || []
        };

        // Валидация
        if (!this.validateReview(reviewData)) {
            return;
        }

        // Добавляем отзыв в начало массива
        const newReview = {
            id: Date.now(),
            ...reviewData,
            date: new Date().toLocaleDateString('ru-RU'),
            hasImage: reviewData.photos.length > 0,
            image: reviewData.photos[0] || null,
            tags: [reviewData.carModel, this.getServiceName(reviewData.service)]
        };

        this.reviews.unshift(newReview);
        this.applyFilters();

        // Закрываем модалку
        this.closeReviewModal();

        // Показываем уведомление
        this.showNotification('Отзыв успешно отправлен на модерацию!');
    }

    // Валидация отзыва
    validateReview(data) {
        if (!data.rating || !data.service || !data.carModel || !data.reviewText) {
            this.showNotification('Пожалуйста, заполните все поля', 'error');
            return false;
        }
        return true;
    }

    // Получение названия услуги
    getServiceName(service) {
        const services = {
            antichrome: 'Антихром',
            carbon: 'Карбон',
            soundproofing: 'Шумоизоляция',
            wheels: 'Колесные диски',
            cleaning: 'Химчистка',
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
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ReviewsManager();
});
