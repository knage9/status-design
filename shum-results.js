// Shum Results Gallery Functionality - Улучшенная версия
document.addEventListener('DOMContentLoaded', function() {
    // DOM элементы
    const thumbnailsContainer = document.getElementById('shumThumbnails');
    const mainImage = document.getElementById('mainShumImage');
    const mainTitle = document.getElementById('mainShumTitle');
    const mainServices = document.getElementById('mainShumServices');
    const prevBtn = document.querySelector('.shum-results__nav-btn--prev');
    const nextBtn = document.querySelector('.shum-results__nav-btn--next');

    // Данные проектов шумоизоляции
    const projects = [
        {
            id: 0,
            title: 'Mercedes GLC',
            images: [
                'img/Gallery-1.png',
                'img/Gallery-2.png',
                'img/Gallery-3.png'
            ],
            thumbnails: [
                'img/Gallery-1.png',
                'img/Gallery-2.png',
                'img/Gallery-3.png'
            ],
            alt: 'Mercedes GLC - Шумоизоляция с арками',
            services: [
                { badge: '12 часов', text: 'Время на работу' },
                { badge: '2 года', text: 'Гарантия' },
                { badge: '88 000₽', text: 'Стоимость' }
            ]
        },
        {
            id: 1,
            title: 'BMW X5',
            images: [
                'img/Gallery-2.png',
                'img/Gallery-3.png',
                'img/Gallery-1.png'
            ],
            thumbnails: [
                'img/Gallery-2.png',
                'img/Gallery-3.png',
                'img/Gallery-1.png'
            ],
            alt: 'BMW X5 - Полная шумоизоляция',
            services: [
                { badge: '16 часов', text: 'Время на работу' },
                { badge: '3 года', text: 'Гарантия' },
                { badge: '120 000₽', text: 'Стоимость' }
            ]
        },
        {
            id: 2,
            title: 'Audi A6',
            images: [
                'img/Gallery-3.png',
                'img/Gallery-1.png',
                'img/Gallery-2.png'
            ],
            thumbnails: [
                'img/Gallery-3.png',
                'img/Gallery-1.png',
                'img/Gallery-2.png'
            ],
            alt: 'Audi A6 - Премиум шумоизоляция',
            services: [
                { badge: '14 часов', text: 'Время на работу' },
                { badge: '2 года', text: 'Гарантия' },
                { badge: '95 000₽', text: 'Стоимость' }
            ]
        }
    ];

    let currentProjectIndex = 0;
    let currentImageIndex = 0;
    let isAutoRotate = true;
    let autoRotateInterval;

    // Генерация миниатюр для проекта
    function generateThumbnails(project) {
        if (!thumbnailsContainer) return [];

        thumbnailsContainer.innerHTML = '';

        project.thumbnails.forEach((thumbnailSrc, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'shum-results__thumbnail';
            thumbnail.dataset.image = index;

            const img = document.createElement('img');
            img.src = thumbnailSrc;
            img.alt = `${project.title} - вид ${index + 1}`;
            img.loading = 'lazy';

            thumbnail.appendChild(img);
            thumbnailsContainer.appendChild(thumbnail);

            // Обработчик клика по миниатюре
            thumbnail.addEventListener('click', () => {
                updateImage(index);
                resetAutoRotate();
            });
        });

        return document.querySelectorAll('.shum-results__thumbnail');
    }

    // Обновление отображения проекта
    function updateProject(projectIndex, animate = true) {
        const project = projects[projectIndex];
        if (!project) return;

        // Анимация перехода
        if (animate) {
            mainImage.style.opacity = '0';
        }

        setTimeout(() => {
            // Обновление основного изображения
            mainImage.src = project.images[currentImageIndex];
            mainImage.alt = project.alt;
            mainTitle.textContent = project.title;

            // Обновление списка услуг
            updateServices(project.services);

            // Генерация и обновление миниатюр
            const newThumbnails = generateThumbnails(project);

            // Обновление активной миниатюры
            updateActiveThumbnail(newThumbnails);

            currentProjectIndex = projectIndex;

            // Восстановление прозрачности
            if (animate) {
                mainImage.style.opacity = '1';
            }
        }, animate ? 150 : 0);
    }

    // Обновление списка услуг
    function updateServices(services) {
        if (!mainServices) return;

        mainServices.innerHTML = '';

        services.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'shum-results__service-item';
            serviceItem.innerHTML = `
                <div class="shum-results__service-badge">${service.badge}</div>
                <div class="shum-results__service-text">${service.text}</div>
            `;
            mainServices.appendChild(serviceItem);
        });
    }

    // Обновление активной миниатюры
    function updateActiveThumbnail(thumbnails) {
        thumbnails.forEach((thumb, i) => {
            if (i === currentImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    // Обновление текущего изображения в рамках проекта
    function updateImage(imageIndex) {
        if (imageIndex < 0 || imageIndex >= projects[currentProjectIndex].images.length) return;

        currentImageIndex = imageIndex;

        // Обновление основного изображения
        mainImage.src = projects[currentProjectIndex].images[currentImageIndex];

        // Обновление активной миниатюры
        const currentThumbnails = document.querySelectorAll('.shum-results__thumbnail');
        updateActiveThumbnail(currentThumbnails);
    }

    // Сброс автопрокрутки
    function resetAutoRotate() {
        isAutoRotate = false;
        clearInterval(autoRotateInterval);

        setTimeout(() => {
            isAutoRotate = true;
            startAutoRotate();
        }, 10000); // Возобновить автопрокрутку через 10 секунд после взаимодействия
    }

    // Запуск автопрокрутки
    function startAutoRotate() {
        autoRotateInterval = setInterval(() => {
            if (isAutoRotate) {
                const nextProjectIndex = currentProjectIndex === projects.length - 1 ? 0 : currentProjectIndex + 1;
                currentImageIndex = 0;
                updateProject(nextProjectIndex);
            }
        }, 8000); // Смена проекта каждые 8 секунд
    }

    // Обработчики кнопок навигации
    function setupNavigation() {
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newProjectIndex = currentProjectIndex === 0 ? projects.length - 1 : currentProjectIndex - 1;
                currentImageIndex = 0;
                updateProject(newProjectIndex);
                resetAutoRotate();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newProjectIndex = currentProjectIndex === projects.length - 1 ? 0 : currentProjectIndex + 1;
                currentImageIndex = 0;
                updateProject(newProjectIndex);
                resetAutoRotate();
            });
        }
    }

    // Проверка видимости элемента
    function isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Пауза автопрокрутки при невидимости страницы
    function handleVisibilityChange() {
        if (document.hidden) {
            clearInterval(autoRotateInterval);
        } else if (isAutoRotate) {
            startAutoRotate();
        }
    }

    // Инициализация галереи
    function initializeGallery() {
        if (projects.length === 0) return;

        // Настройка навигации
        setupNavigation();

        // Запуск автопрокрутки
        startAutoRotate();

        // Обработка изменения видимости страницы
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Инициализация первого проекта
        updateProject(0, false);

        // Предзагрузка следующих изображений
        preloadImages();
    }

    // Предзагрузка изображений для плавных переходов
    function preloadImages() {
        projects.forEach(project => {
            project.images.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        });
    }

    // Обработка ошибок загрузки изображений
    function handleImageError(img) {
        img.src = 'img/placeholder.png'; // Замените на путь к изображению-заглушке
        img.alt = 'Изображение недоступно';
    }

    // Добавление обработчиков ошибок для изображений
    function setupImageErrorHandlers() {
        const images = document.querySelectorAll('#mainShumImage, .shum-results__thumbnail img');
        images.forEach(img => {
            img.addEventListener('error', function() {
                handleImageError(this);
            });
        });
    }

    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGallery);
    } else {
        initializeGallery();
    }

    // Настройка обработчиков ошибок изображений после инициализации
    setTimeout(setupImageErrorHandlers, 100);
});
