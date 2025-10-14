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
        // Загружаем данные из общего источника
        this.newsData = NEWS_DATA;
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
                if (this.currentCategory === 'articles') return item.type === 'article' && item.category === 'articles';
                if (this.currentCategory === 'actions') return item.type === 'article' && item.category === 'actions';
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
                    <div class="news-card__date">${formatDate(newsItem.date)}</div>
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <div class="news-card__tags">
                        ${newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            // Карточка статьи или акции (только текст)
            const truncatedContent = this.truncateTextByLines(newsItem.content, 4);

            cardContent = `
                <div class="news-card__content">
                    <div class="news-card__date">${formatDate(newsItem.date)}</div>
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <p class="news-card__description">${truncatedContent}</p>
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

    // Функция для обрезки текста по количеству строк
    truncateTextByLines(text, maxLines) {
        if (!text) return '';

        // Создаем временный элемент для измерения
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.height = 'auto';
        tempDiv.style.width = '280px'; // Примерная ширина карточки
        tempDiv.style.lineHeight = '1.25';
        tempDiv.style.fontSize = '18px';
        tempDiv.style.fontFamily = 'Inter, sans-serif';
        tempDiv.style.wordWrap = 'break-word';

        document.body.appendChild(tempDiv);

        let result = '';
        const words = text.trim().split(' ');

        // Добавляем слова по одному, пока не превысим количество строк
        for (let i = 0; i < words.length; i++) {
            tempDiv.textContent = words.slice(0, i + 1).join(' ') + '...';
            const lines = Math.round(tempDiv.scrollHeight / (parseInt(tempDiv.style.lineHeight) * parseInt(tempDiv.style.fontSize)));

            if (lines > maxLines) {
                result = words.slice(0, i).join(' ') + '...';
                break;
            }
        }

        // Если текст помещается в заданное количество строк, возвращаем его как есть
        if (!result) {
            result = text;
        }

        document.body.removeChild(tempDiv);
        return result;
    }

    loadMoreNews() {
        this.currentPage++;
        this.renderNews();
    }

    openNewsDetail(newsId) {
        // Переходим на детальную страницу новости с параметром ID
        window.location.href = `news-detail.html?id=${newsId}`;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new NewsManager();
});
