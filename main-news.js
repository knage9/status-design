// Скрипт для загрузки новостей на главную страницу
class MainNewsManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadMainNews();
    }

    async loadMainNews() {
        try {
            const response = await fetch('/api/posts');
            if (!response.ok) throw new Error('Failed to fetch news');

            const data = await response.json();

            // Map and sort news from API
            const newsData = data.map(item => {
                const rawDate = item.datePublished || item.dateCreated;
                return {
                    id: item.id,
                    title: item.title,
                    date: rawDate,
                    type: item.type === 'NEWS' ? 'news' : 'article',
                    category: item.category === 'NEWS' ? 'news' : 'articles',
                    content: item.content,
                    image: item.image || null,
                    tags: item.tags || [],
                    slug: item.slug
                };
            })
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 4);

            this.renderMainNews(newsData);
        } catch (error) {
            console.error('Error loading main news:', error);
            const newsGrid = document.querySelector('.news__grid');
            if (newsGrid) {
                newsGrid.innerHTML = '<div class="no-news">Не удалось загрузить новости. Пожалуйста, обновите страницу.</div>';
            }
        }
    }

    renderMainNews(newsData) {
        const newsGrid = document.querySelector('.news__grid');
        if (!newsGrid) return;

        newsGrid.innerHTML = '';

        if (newsData.length === 0) {
            newsGrid.innerHTML = '<div class="no-news">Новости не найдены</div>';
            return;
        }

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

        // Safely use formatDate from news-data.js if available
        const displayedDate = typeof formatDate === 'function' ? formatDate(newsItem.date) : newsItem.date;

        if (newsItem.type === 'news' && newsItem.image) {
            // Карточка новости с изображением
            cardContent = `
                <div class="news-card__image">
                    <img src="${newsItem.image}" alt="${newsItem.title}">
                </div>
                <div class="news-card__content">
                    <div class="news-card__date">${displayedDate}</div>
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <div class="news-card__tags">
                        ${newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            // Карточка статьи или акции (только текст)
            const description = newsItem.content.length > 120 ? newsItem.content.substring(0, 120) + '...' : newsItem.content;

            cardContent = `
                <div class="news-card__content">
                    <div class="news-card__date">${displayedDate}</div>
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <p class="news-card__description">${description}</p>
                    <div class="news-card__tags">
                        ${newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        cardDiv.innerHTML = cardContent;

        // Добавляем обработчик клика для перехода к полной новости
        cardDiv.addEventListener('click', () => {
            if (newsItem.slug) {
                window.location.href = `news-detail.html?slug=${newsItem.slug}`;
            } else {
                window.location.href = `news.html#${newsItem.id}`;
            }
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
