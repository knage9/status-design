// Скрипт для загрузки новостей на главную страницу
class MainNewsManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadMainNews();
    }

    async loadMainNews() {
        // Подключаем данные из общего источника
        const newsData = getLatestNewsForMain();
        this.renderMainNews(newsData);
    }

    renderMainNews(newsData) {
        const newsGrid = document.querySelector('.news__grid');
        if (!newsGrid) return;

        newsGrid.innerHTML = '';

        newsData.forEach(newsItem => {
            const cardElement = this.createMainNewsCard(newsItem);
            newsGrid.appendChild(cardElement);
        });
    }

    createMainNewsCard(newsItem) {
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
            // Карточка статьи или акции (только текст) - теперь все акции тоже article
            cardContent = `
                <div class="news-card__content">
                    <div class="news-card__date">${formatDate(newsItem.date)}</div>
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <p class="news-card__description">${newsItem.content.length > 120 ? newsItem.content.substring(0, 120) + '...' : newsItem.content}</p>
                    <div class="news-card__tags">
                        ${newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        cardDiv.innerHTML = cardContent;

        // Добавляем обработчик клика для перехода к полной новости
        cardDiv.addEventListener('click', () => {
            window.location.href = `news.html#${newsItem.id}`;
        });

        return cardDiv;
    }
}

// Автоматически загружаем новости при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что мы на главной странице (есть элемент news__grid)
    if (document.querySelector('.news__grid')) {
        new MainNewsManager();
    }
});
