// Portfolio Page JavaScript
class PortfolioManager {
    constructor() {
        this.portfolioData = [];
        this.filteredPortfolio = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentBrand = 'all';
        this.currentService = 'all';
        this.currentSort = 'date';
        this.activeFilters = new Set();

        this.init();
    }

    init() {
        this.loadPortfolioData();
        this.setupFilterOptions();
        this.setupEventListeners();
        this.renderPortfolio();
    }

    loadPortfolioData() {
        // Загружаем данные из созданного файла
        this.portfolioData = PORTFOLIO_DATA;
        this.filteredPortfolio = [...this.portfolioData];
    }

    setupFilterOptions() {
        // Добавляем опции марок автомобилей
        const brandMenu = document.getElementById('brandMenu');
        if (brandMenu) {
            const brands = getAllCarBrands();
            brands.forEach(brand => {
                const option = document.createElement('div');
                option.className = 'filter-dropdown__option';
                option.textContent = brand;
                option.setAttribute('data-value', brand);
                brandMenu.appendChild(option);
            });
        }

        // Добавляем опции услуг
        const serviceMenu = document.getElementById('serviceMenu');
        if (serviceMenu) {
            const services = getAllServices();
            services.forEach(service => {
                const option = document.createElement('div');
                option.className = 'filter-dropdown__option';
                option.textContent = service;
                option.setAttribute('data-value', service);
                serviceMenu.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        // Фильтры марок
        const brandToggle = document.getElementById('brandToggle');
        const brandMenu = document.getElementById('brandMenu');

        if (brandToggle && brandMenu) {
            brandToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeAllDropdowns();
                brandMenu.classList.toggle('active');
            });

            brandMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-dropdown__option')) {
                    this.currentBrand = e.target.dataset.value;
                    this.updateBrandText(e.target.textContent);
                    this.updateActiveFilters();
                    brandMenu.classList.remove('active');
                    this.applyFilters();
                }
            });
        }

        // Фильтры услуг
        const serviceToggle = document.getElementById('serviceToggle');
        const serviceMenu = document.getElementById('serviceMenu');

        if (serviceToggle && serviceMenu) {
            serviceToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeAllDropdowns();
                serviceMenu.classList.toggle('active');
            });

            serviceMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-dropdown__option')) {
                    this.currentService = e.target.dataset.value;
                    this.updateServiceText(e.target.textContent);
                    this.updateActiveFilters();
                    serviceMenu.classList.remove('active');
                    this.applyFilters();
                }
            });
        }

        // Фильтры сортировки
        const sortToggle = document.getElementById('sortToggle');
        const sortMenu = document.getElementById('sortMenu');

        if (sortToggle && sortMenu) {
            sortToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeAllDropdowns();
                sortMenu.classList.toggle('active');
            });

            sortMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-dropdown__option')) {
                    this.currentSort = e.target.dataset.value;
                    this.updateSortText(e.target.textContent);
                    sortMenu.classList.remove('active');
                    this.applyFilters();
                }
            });
        }

        // Кнопка "Показать еще"
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.loadMorePortfolio();
            });
        }

        // Модальное окно
        this.setupModalEvents();

        // Закрытие дропдаунов при клике вне их
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    updateBrandText(text) {
        const brandToggle = document.getElementById('brandToggle');
        if (brandToggle) {
            const textElement = brandToggle.querySelector('.filter-dropdown__text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    updateServiceText(text) {
        const serviceToggle = document.getElementById('serviceToggle');
        if (serviceToggle) {
            const textElement = serviceToggle.querySelector('.filter-dropdown__text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    updateSortText(text) {
        const sortToggle = document.getElementById('sortToggle');
        if (sortToggle) {
            const textElement = sortToggle.querySelector('.filter-dropdown__text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (!activeFiltersContainer) return;

        activeFiltersContainer.innerHTML = '';

        // Добавляем активные фильтры
        if (this.currentBrand !== 'all') {
            this.addActiveFilter('brand', this.currentBrand, this.getBrandDisplayName(this.currentBrand));
        }

        if (this.currentService !== 'all') {
            this.addActiveFilter('service', this.currentService, this.currentService);
        }

        // Показываем контейнер только если есть активные фильтры
        activeFiltersContainer.style.display = this.activeFilters.size > 0 ? 'block' : 'none';
    }

    addActiveFilter(type, value, displayName) {
        const filterElement = document.createElement('div');
        filterElement.className = 'active-filter';
        filterElement.innerHTML = `
            <span>${displayName}</span>
            <button class="active-filter__remove" data-type="${type}" data-value="${value}">×</button>
        `;

        // Обработчик для удаления фильтра
        const removeBtn = filterElement.querySelector('.active-filter__remove');
        removeBtn.addEventListener('click', () => {
            this.removeFilter(type, value);
        });

        const activeFiltersContainer = document.getElementById('activeFilters');
        if (activeFiltersContainer) {
            activeFiltersContainer.appendChild(filterElement);
        }

        this.activeFilters.add(`${type}:${value}`);
    }

    removeFilter(type, value) {
        // Сбрасываем соответствующий фильтр
        if (type === 'brand') {
            this.currentBrand = 'all';
            this.updateBrandText('Все марки');
        } else if (type === 'service') {
            this.currentService = 'all';
            this.updateServiceText('Все услуги');
        }

        this.activeFilters.delete(`${type}:${value}`);
        this.applyFilters();
    }

    getBrandDisplayName(brand) {
        const brandNames = {
            'Mercedes-Benz': 'Mercedes-Benz',
            'BMW': 'BMW',
            'Audi': 'Audi',
            'Porsche': 'Porsche',
            'Lexus': 'Lexus',
            'Land Rover': 'Land Rover',
            'Tesla': 'Tesla'
        };
        return brandNames[brand] || brand;
    }

    closeAllDropdowns() {
        document.querySelectorAll('.filter-dropdown__menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    }

    applyFilters() {
        this.currentPage = 1;

        // Фильтрация по марке
        let filtered = this.portfolioData;
        if (this.currentBrand !== 'all') {
            filtered = filtered.filter(item => item.carBrand === this.currentBrand);
        }

        // Фильтрация по услугам
        if (this.currentService !== 'all') {
            filtered = filtered.filter(item => item.services.includes(this.currentService));
        }

        // Сортировка
        this.sortPortfolio(filtered);

        this.updateActiveFilters();
        this.renderPortfolio();
    }

    sortPortfolio(portfolioArray) {
        const sorted = [...portfolioArray];

        sorted.sort((a, b) => {
            switch (this.currentSort) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'popular':
                    return b.views - a.views;
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        this.filteredPortfolio = sorted;
    }

    renderPortfolio() {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const portfolioToShow = this.filteredPortfolio.slice(startIndex, endIndex);

        grid.innerHTML = '';

        if (portfolioToShow.length === 0) {
            grid.innerHTML = '<div class="no-portfolio">Работы не найдены</div>';
            this.updateShowMoreButton(false);
            return;
        }

        portfolioToShow.forEach(portfolioItem => {
            const cardElement = this.createPortfolioCard(portfolioItem);
            grid.appendChild(cardElement);
        });

        // Показываем/скрываем кнопку "Показать еще"
        this.updateShowMoreButton(endIndex < this.filteredPortfolio.length);
    }

    createPortfolioCard(portfolioItem) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'portfolio-card';
        cardDiv.setAttribute('data-id', portfolioItem.id);

        const cardContent = `
            <div class="portfolio-card__image">
                <img src="${portfolioItem.mainImage}" alt="${portfolioItem.title}">
            </div>
            <div class="portfolio-card__content">
                <h3 class="portfolio-card__title">${portfolioItem.title}</h3>
                <div class="portfolio-card__brand">${portfolioItem.carBrand}</div>
                <div class="portfolio-card__model">${portfolioItem.carModel}</div>
                <div class="portfolio-card__services">
                    ${portfolioItem.services.map(service => `<span class="portfolio-card__service">${service}</span>`).join('')}
                </div>
                <div class="portfolio-card__date">${formatPortfolioDate(portfolioItem.date)}</div>
            </div>
        `;

        cardDiv.innerHTML = cardContent;

        // Добавляем обработчик клика для открытия модального окна
        cardDiv.addEventListener('click', () => {
            this.openPortfolioModal(portfolioItem.id);
        });

        return cardDiv;
    }

    updateShowMoreButton(show) {
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            showMoreBtn.style.display = show ? 'flex' : 'none';
        }
    }

    loadMorePortfolio() {
        this.currentPage++;
        this.renderPortfolio();
    }

    setupModalEvents() {
        const modal = document.getElementById('portfolioModal');
        const closeBtn = document.getElementById('modalClose');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePortfolioModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePortfolioModal();
                }
            });
        }

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                this.closePortfolioModal();
            }
        });
    }

    openPortfolioModal(portfolioId) {
        const portfolioItem = getPortfolioById(portfolioId);
        if (!portfolioItem) return;

        const modal = document.getElementById('portfolioModal');
        if (!modal) return;

        // Заполняем модальное окно данными
        document.getElementById('modalMainImage').src = portfolioItem.mainImage;
        document.getElementById('modalTitle').textContent = portfolioItem.title;
        document.getElementById('modalBrand').textContent = portfolioItem.carBrand;
        document.getElementById('modalModel').textContent = portfolioItem.carModel;
        document.getElementById('modalDate').textContent = formatPortfolioDate(portfolioItem.date);
        document.getElementById('modalDescription').textContent = portfolioItem.description;

        // Добавляем услуги
        const servicesContainer = document.getElementById('modalServices');
        servicesContainer.innerHTML = '';
        portfolioItem.services.forEach(service => {
            const serviceTag = document.createElement('span');
            serviceTag.className = 'portfolio-modal__service-tag';
            serviceTag.textContent = service;
            servicesContainer.appendChild(serviceTag);
        });

        // Добавляем галерею миниатюр
        this.renderModalGallery(portfolioItem);

        // Показываем модальное окно
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    renderModalGallery(portfolioItem) {
        const thumbnailsContainer = document.getElementById('modalThumbnails');
        if (!thumbnailsContainer) return;

        thumbnailsContainer.innerHTML = '';

        portfolioItem.gallery.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `portfolio-modal__thumbnail ${index === 0 ? 'portfolio-modal__thumbnail--active' : ''}`;
            thumbnail.innerHTML = `<img src="${image}" alt="Thumbnail ${index + 1}">`;

            thumbnail.addEventListener('click', () => {
                // Меняем главное изображение
                document.getElementById('modalMainImage').src = image;

                // Убираем активный класс со всех миниатюр
                thumbnailsContainer.querySelectorAll('.portfolio-modal__thumbnail').forEach(thumb => {
                    thumb.classList.remove('portfolio-modal__thumbnail--active');
                });

                // Добавляем активный класс к выбранной миниатюре
                thumbnail.classList.add('portfolio-modal__thumbnail--active');
            });

            thumbnailsContainer.appendChild(thumbnail);
        });
    }

    closePortfolioModal() {
        const modal = document.getElementById('portfolioModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioManager();
});
