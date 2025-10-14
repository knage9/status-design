// News Detail Page JavaScript
class NewsDetailManager {
    constructor() {
        this.newsId = this.getNewsIdFromUrl();
        this.newsData = null;
        this.relatedNews = [];

        this.init();
    }

    init() {
        if (this.newsId) {
            this.loadNewsData();
        } else {
            this.showError('Новость не найдена');
        }
    }

    getNewsIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    loadNewsData() {
        // Загружаем данные из общего источника
        this.newsData = NEWS_DATA.find(item => item.id == this.newsId);

        if (this.newsData) {
            this.renderNewsDetail();
            this.updateMetaTags();
            this.loadRelatedNews();
            this.updateStructuredData();
        } else {
            this.showError('Новость не найдена');
        }
    }

    renderNewsDetail() {
        const detailContainer = document.getElementById('newsDetail');
        if (!detailContainer || !this.newsData) return;

        const newsHtml = this.createNewsDetailHtml();
        detailContainer.innerHTML = newsHtml;

        // Обновляем breadcrumb
        this.updateBreadcrumb();
    }

    createNewsDetailHtml() {
        const { newsData } = this;

        if (newsData.type === 'news' && newsData.image) {
            // Детальная страница для новости с изображением - в стиле сайта
            return `
                <div class="news-detail__header">
                    <div class="news-detail__image">
                        <img src="${newsData.image}" alt="${newsData.title}" loading="lazy">
                    </div>
                    <div class="news-detail__meta">
                        <div class="news-detail__date">${formatDate(newsData.date)}</div>
                        <div class="news-detail__type">${this.getTypeLabel(newsData.type)}</div>
                        <div class="news-detail__views">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${newsData.views} просмотров
                        </div>
                    </div>
                </div>
                <div class="news-detail__content">
                    <h1 class="news-detail__title">${newsData.title}</h1>
                    <div class="news-detail__text">
                        ${this.formatNewsContent(newsData.content)}
                    </div>
                    <div class="news-detail__tags">
                        ${newsData.tags.map(tag => `<span class="news-tag news-tag--detail">${tag}</span>`).join('')}
                    </div>
                    <div class="news-detail__cta">
                        <button class="btn-primary" onclick="window.openPopup()">
                            Обсудить проект
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Детальная страница для статьи или акции - в стиле сайта
            return `
                <div class="news-detail__content news-detail__content--text">
                    <div class="news-detail__meta">
                        <div class="news-detail__date">${formatDate(newsData.date)}</div>
                        <div class="news-detail__type">${this.getTypeLabel(newsData.type)}</div>
                        <div class="news-detail__views">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${newsData.views} просмотров
                        </div>
                    </div>
                    <h1 class="news-detail__title">${newsData.title}</h1>
                    <div class="news-detail__text">
                        ${this.formatNewsContent(newsData.content)}
                    </div>
                    <div class="news-detail__tags">
                        ${newsData.tags.map(tag => `<span class="news-tag news-tag--detail">${tag}</span>`).join('')}
                    </div>
                    <div class="news-detail__cta">
                        <button class="btn-primary" onclick="window.openPopup()">
                            ${newsData.category === 'actions' ? 'Воспользоваться предложением' : 'Обсудить проект'}
                        </button>
                    </div>
                </div>
            `;
        }
    }

    formatNewsContent(content) {
        // Разбиваем текст на абзацы для лучшей читаемости
        return content.split('\n').map(paragraph => {
            const trimmed = paragraph.trim();
            return trimmed ? `<p>${trimmed}</p>` : '';
        }).join('');
    }

    getTypeLabel(type) {
        switch (type) {
            case 'news': return 'Новости';
            case 'article': return 'Статья';
            default: return 'Новость';
        }
    }

    updateMetaTags() {
        if (!this.newsData) return;

        const { newsData } = this;

        // Обновляем title
        const titleElement = document.getElementById('news-title');
        if (titleElement) {
            titleElement.textContent = `${newsData.title} - Тюнинг премиум класса в Москве | Status Design`;
        }

        // Обновляем description
        const descElement = document.getElementById('news-description');
        if (descElement) {
            const shortDesc = newsData.content.substring(0, 150) + '...';
            descElement.setAttribute('content', shortDesc);
        }

        // Обновляем keywords
        const keywordsElement = document.getElementById('news-keywords');
        if (keywordsElement) {
            const keywords = this.generateKeywords(newsData);
            keywordsElement.setAttribute('content', keywords);
        }

        // Обновляем canonical URL
        const canonicalElement = document.getElementById('news-canonical');
        if (canonicalElement) {
            const canonicalUrl = `https://statusdesign.ru/news-detail.html?id=${newsData.id}`;
            canonicalElement.setAttribute('href', canonicalUrl);
        }

        // Обновляем Open Graph мета-теги
        this.updateOpenGraphTags();

        // Обновляем Twitter мета-теги
        this.updateTwitterTags();

        // Обновляем время публикации
        this.updatePublishTime();
    }

    generateKeywords(newsData) {
        const baseKeywords = ['тюнинг', 'автомобиль', 'Москва', 'премиум класс'];
        const newsKeywords = newsData.title.toLowerCase().split(' ').filter(word => word.length > 3);

        // Добавляем теги как ключевые слова
        const tagKeywords = newsData.tags.flatMap(tag => tag.toLowerCase().split(' '));

        const allKeywords = [...new Set([...baseKeywords, ...newsKeywords, ...tagKeywords])];
        return allKeywords.slice(0, 10).join(', ');
    }

    updateOpenGraphTags() {
        const { newsData } = this;

        // Open Graph URL
        const ogUrl = document.getElementById('news-og-url');
        if (ogUrl) {
            ogUrl.setAttribute('content', `https://statusdesign.ru/news-detail.html?id=${newsData.id}`);
        }

        // Open Graph title
        const ogTitle = document.getElementById('news-og-title');
        if (ogTitle) {
            ogTitle.setAttribute('content', `${newsData.title} - Status Design`);
        }

        // Open Graph description
        const ogDesc = document.getElementById('news-og-description');
        if (ogDesc) {
            const shortDesc = newsData.content.substring(0, 200) + '...';
            ogDesc.setAttribute('content', shortDesc);
        }

        // Open Graph image
        const ogImage = document.getElementById('news-og-image');
        if (ogImage) {
            const imageUrl = newsData.image || 'img/news_img_1.png';
            ogImage.setAttribute('content', `https://statusdesign.ru/${imageUrl}`);
        }

        // Article section
        const section = document.getElementById('news-section');
        if (section) {
            section.setAttribute('content', this.getTypeLabel(newsData.type));
        }
    }

    updateTwitterTags() {
        const { newsData } = this;

        // Twitter URL
        const twitterUrl = document.getElementById('news-twitter-url');
        if (twitterUrl) {
            twitterUrl.setAttribute('content', `https://statusdesign.ru/news-detail.html?id=${newsData.id}`);
        }

        // Twitter title
        const twitterTitle = document.getElementById('news-twitter-title');
        if (twitterTitle) {
            twitterTitle.setAttribute('content', `${newsData.title} - Status Design`);
        }

        // Twitter description
        const twitterDesc = document.getElementById('news-twitter-description');
        if (twitterDesc) {
            const shortDesc = newsData.content.substring(0, 200) + '...';
            twitterDesc.setAttribute('content', shortDesc);
        }

        // Twitter image
        const twitterImage = document.getElementById('news-twitter-image');
        if (twitterImage) {
            const imageUrl = newsData.image || 'img/news_img_1.png';
            twitterImage.setAttribute('content', `https://statusdesign.ru/${imageUrl}`);
        }
    }

    updatePublishTime() {
        const { newsData } = this;

        // Published time
        const publishedTime = document.getElementById('news-published-time');
        if (publishedTime) {
            const pubDate = new Date(newsData.date).toISOString();
            publishedTime.setAttribute('content', pubDate);
        }

        // Modified time (устанавливаем как published для простоты)
        const modifiedTime = document.getElementById('news-modified-time');
        if (modifiedTime) {
            const modDate = new Date(newsData.date).toISOString();
            modifiedTime.setAttribute('content', modDate);
        }
    }

    updateBreadcrumb() {
        const currentElement = document.getElementById('breadcrumb-current');
        if (currentElement) {
            currentElement.textContent = this.newsData.title;
        }
    }

    loadRelatedNews() {
        if (!this.newsData) return;

        // Находим похожие новости по типу и тегам
        this.relatedNews = NEWS_DATA
            .filter(item => item.id != this.newsData.id)
            .filter(item => {
                // Похожий тип контента
                if (this.newsData.type === 'news' && item.type === 'news') return true;
                if (this.newsData.type === 'article' && item.type === 'article') {
                    // Похожая категория для статей
                    return item.category === this.newsData.category;
                }
                return false;
            })
            .slice(0, 3); // Берем только 3 похожие новости

        this.renderRelatedNews();
    }

    renderRelatedNews() {
        const grid = document.getElementById('relatedNewsGrid');
        if (!grid || this.relatedNews.length === 0) return;

        grid.innerHTML = '';

        this.relatedNews.forEach(newsItem => {
            const cardElement = this.createRelatedNewsCard(newsItem);
            grid.appendChild(cardElement);
        });
    }

    createRelatedNewsCard(newsItem) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'news-card news-card--related';
        cardDiv.setAttribute('data-id', newsItem.id);

        const truncatedContent = this.truncateText(newsItem.content, 100);

        let cardContent = '';

        if (newsItem.type === 'news' && newsItem.image) {
            cardContent = `
                <div class="news-card__image">
                    <img src="${newsItem.image}" alt="${newsItem.title}" loading="lazy">
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

        // Добавляем обработчик клика
        cardDiv.addEventListener('click', () => {
            window.location.href = `news-detail.html?id=${newsItem.id}`;
        });

        return cardDiv;
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).replace(/\s+\w*$/, '') + '...';
    }

    updateStructuredData() {
        const structuredDataElement = document.getElementById('newsStructuredData');
        if (!structuredDataElement || !this.newsData) return;

        const { newsData } = this;
        const currentUrl = `https://statusdesign.ru/news-detail.html?id=${newsData.id}`;

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": newsData.title,
            "description": newsData.content.substring(0, 200) + '...',
            "image": newsData.image ? `https://statusdesign.ru/${newsData.image}` : "https://statusdesign.ru/img/news_img_1.png",
            "datePublished": new Date(newsData.date).toISOString(),
            "dateModified": new Date(newsData.date).toISOString(),
            "author": {
                "@type": "Organization",
                "name": "Status Design",
                "url": "https://statusdesign.ru"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Status Design",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://statusdesign.ru/img/logo.svg"
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": currentUrl
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Главная",
                        "item": "https://statusdesign.ru/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Новости",
                        "item": "https://statusdesign.ru/news.html"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": newsData.title,
                        "item": currentUrl
                    }
                ]
            }
        };

        structuredDataElement.textContent = JSON.stringify(structuredData, null, 2);
    }

    showError(message) {
        const detailContainer = document.getElementById('newsDetail');
        if (detailContainer) {
            detailContainer.innerHTML = `
                <div class="news-detail__error">
                    <h1>Ошибка</h1>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="window.location.href='news.html'">
                        Вернуться к новостям
                    </button>
                </div>
            `;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new NewsDetailManager();
});
