// News Page JavaScript
class NewsManager {
    constructor() {
        this.newsData = [];
        this.filteredNews = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentCategory = 'all';
        this.currentSort = 'date';

        this.init();
    }

    init() {
        this.loadNewsData();
        this.setupEventListeners();
        this.renderNews();
    }

    loadNewsData() {
        // Загружаем данные новостей и статей
        this.newsData = [
            // Новости
            {
                id: 1,
                type: 'news',
                title: 'Шумоизоляция вашего авто — теперь за 1 день!',
                image: 'img/news_img_1.png',
                category: 'news',
                date: '2024-01-15',
                views: 245,
                content: 'Ищете где быстро сделать шумоизоляцию вашего автомобиля? Теперь мы предлагаем услугу шумоизоляции за 1 день без потери качества услуги!',
                tags: ['Новости']
            },
            {
                id: 2,
                type: 'news',
                title: 'Антихром — современное решение для автомобиля',
                image: 'img/news_img_2.png',
                category: 'news',
                date: '2024-01-12',
                views: 189,
                content: 'Антихром становится всё популярнее среди владельцев премиальных автомобилей. Узнайте о преимуществах этого решения.',
                tags: ['Новости']
            },
            {
                id: 3,
                type: 'news',
                title: 'Расширение услуг: теперь доступны все марки BMW',
                image: 'img/news_img_1.png',
                category: 'news',
                date: '2024-01-10',
                views: 156,
                content: 'Мы рады сообщить, что теперь выполняем работы по тюнингу для всех моделей BMW, включая последние новинки.',
                tags: ['Новости']
            },
            {
                id: 4,
                type: 'news',
                title: 'Новые материалы для карбонового тюнинга',
                image: 'img/news_img_2.png',
                category: 'news',
                date: '2024-01-08',
                views: 203,
                content: 'В наш ассортимент добавлены премиальные карбоновые материалы от ведущих мировых производителей.',
                tags: ['Новости']
            },

            // Статьи
            {
                id: 5,
                type: 'article',
                title: 'Зачем нужна шумоизоляция автомобиля',
                category: 'articles',
                date: '2024-01-14',
                views: 312,
                content: 'Шумоизоляция автомобиля — это не роскошь, а необходимость для комфортного вождения. В нашей подробной статье мы расскажем о преимуществах профессиональной шумоизоляции, материалах и процессе установки.',
                tags: ['Статья']
            },
            {
                id: 6,
                type: 'article',
                title: 'Руководство по выбору антихрома для вашего авто',
                category: 'articles',
                date: '2024-01-11',
                views: 278,
                content: 'Антихром — это современное решение для изменения внешнего вида автомобиля. В этой статье мы подробно расскажем о том, как выбрать подходящий вариант антихрома для вашей модели.',
                tags: ['Статья']
            },
            {
                id: 7,
                type: 'article',
                title: 'Преимущества карбонового тюнинга',
                category: 'articles',
                date: '2024-01-09',
                views: 195,
                content: 'Карбоновый тюнинг не только улучшает внешний вид автомобиля, но и влияет на его технические характеристики. Узнайте о всех преимуществах карбоновых элементов.',
                tags: ['Статья']
            },
            {
                id: 8,
                type: 'article',
                title: 'Как ухаживать за автомобилем после тюнинга',
                category: 'articles',
                date: '2024-01-07',
                views: 167,
                content: 'Правильный уход за тюнингованными элементами — залог их долговечности. Мы расскажем о том, как сохранить первозданный вид вашего автомобиля после тюнинга.',
                tags: ['Статья']
            },

            // Акции
            {
                id: 9,
                type: 'action',
                title: 'Скидка до 50% на антихром с покраской',
                category: 'actions',
                date: '2024-01-13',
                views: 445,
                content: 'Ограниченное предложение на услуги "Антихром с помощью покраски". Успей воспользоваться предложением по выгодной цене! Акция действует до конца месяца.',
                tags: ['Акция']
            },
            {
                id: 10,
                type: 'action',
                title: 'Комплексный тюнинг со скидкой 30%',
                category: 'actions',
                date: '2024-01-06',
                views: 389,
                content: 'Специальное предложение для комплексного тюнинга: антихром + шумоизоляция + карбоновые элементы со скидкой 30%. Экономьте на полном преображении вашего автомобиля.',
                tags: ['Акция']
            },
            {
                id: 11,
                type: 'action',
                title: 'Бесплатная диагностика для новых клиентов',
                category: 'actions',
                date: '2024-01-05',
                views: 234,
                content: 'Новые клиенты могут получить бесплатную диагностику состояния автомобиля и консультацию по возможным вариантам тюнинга. Предложение ограничено!',
                tags: ['Акция']
            },
            {
                id: 12,
                type: 'action',
                title: 'Сезонная скидка на шумоизоляцию',
                category: 'actions',
                date: '2024-01-03',
                views: 198,
                content: 'Подготовьте ваш автомобиль к весеннему сезону! Скидка 25% на все виды шумоизоляции до конца марта. Качество работ гарантируем.',
                tags: ['Акция']
            }
        ];

        this.filteredNews = [...this.newsData];
    }

    setupEventListeners() {
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
                    this.updateSortText(e.target.textContent);
                    sortMenu.classList.remove('active');
                    this.applyFilters();
                }
            });
        }

        // Фильтры категорий
        const categoryToggle = document.getElementById('categoryToggle');
        const categoryMenu = document.getElementById('categoryMenu');

        if (categoryToggle && categoryMenu) {
            categoryToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                categoryMenu.classList.toggle('active');
            });

            categoryMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-dropdown__option')) {
                    this.currentCategory = e.target.dataset.value;
                    this.updateCategoryText(e.target.textContent);
                    categoryMenu.classList.remove('active');
                    this.applyFilters();
                }
            });
        }

        // Кнопка "Показать еще"
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.loadMoreNews();
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

    updateSortText(text) {
        const sortToggle = document.getElementById('sortToggle');
        if (sortToggle) {
            const textElement = sortToggle.querySelector('.filter-dropdown__text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    updateCategoryText(text) {
        const categoryToggle = document.getElementById('categoryToggle');
        if (categoryToggle) {
            const textElement = categoryToggle.querySelector('.filter-dropdown__text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    applyFilters() {
        this.currentPage = 1;

        // Фильтрация по категории
        if (this.currentCategory === 'all') {
            this.filteredNews = [...this.newsData];
        } else {
            this.filteredNews = this.newsData.filter(item => {
                if (this.currentCategory === 'news') return item.type === 'news';
                if (this.currentCategory === 'articles') return item.type === 'article';
                if (this.currentCategory === 'actions') return item.type === 'action';
                return true;
            });
        }

        // Сортировка
        this.sortNews();

        this.renderNews();
    }

    sortNews() {
        this.filteredNews.sort((a, b) => {
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
    }

    renderNews() {
        const grid = document.getElementById('newsGrid');
        if (!grid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const newsToShow = this.filteredNews.slice(startIndex, endIndex);

        grid.innerHTML = '';

        if (newsToShow.length === 0) {
            grid.innerHTML = '<div class="no-news">Новости не найдены</div>';
            return;
        }

        newsToShow.forEach(newsItem => {
            const cardElement = this.createNewsCard(newsItem);
            grid.appendChild(cardElement);
        });

        // Показываем/скрываем кнопку "Показать еще"
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            if (endIndex < this.filteredNews.length) {
                showMoreBtn.style.display = 'flex';
            } else {
                showMoreBtn.style.display = 'none';
            }
        }
    }

    createNewsCard(newsItem) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `news-card news-card--${newsItem.type}`;
        cardDiv.setAttribute('data-id', newsItem.id);

        let cardContent = '';

        if (newsItem.type === 'news' && newsItem.image) {
            // Карточка новости с изображением
            cardContent = `
                <div class="news-card__image">
                    <img src="${newsItem.image}" alt="${newsItem.title}">
                </div>
                <div class="news-card__content">
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <div class="news-card__tags">
                        ${newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            // Карточка статьи или акции (только текст)
            cardContent = `
                <div class="news-card__content">
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <p class="news-card__description">${newsItem.content}</p>
                    <div class="news-card__tags">
                        ${newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        cardDiv.innerHTML = cardContent;

        // Добавляем обработчик клика для перехода к полной статье
        cardDiv.addEventListener('click', () => {
            this.openNewsDetail(newsItem.id);
        });

        return cardDiv;
    }

    loadMoreNews() {
        this.currentPage++;
        this.renderNews();
    }

    openNewsDetail(newsId) {
        // Здесь можно добавить логику для открытия полной статьи
        console.log('Открываем новость:', newsId);
        // Например, можно открыть модальное окно или перейти на отдельную страницу
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new NewsManager();
});
