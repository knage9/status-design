// News Detail Page JavaScript




class NewsDetailManager {
    constructor() {
        this.slug = this.getSlugFromUrl();
        this.newsData = null;
        this.relatedNews = [];

        this.init();
    }

    init() {
        if (this.slug) {
            this.loadNewsData();
        } else {
            this.showError('Новость не найдена');
        }
    }

    getSlugFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('slug');
    }

    async loadNewsData() {
        try {
            const response = await fetch(`http://localhost:3000/api/posts/${this.slug}`);
            if (!response.ok) throw new Error('Post not found');

            const item = await response.json();

            this.newsData = {
                id: item.id,
                title: item.title,
                rawDate: item.datePublished || item.dateCreated,
                date: new Date(item.datePublished || item.dateCreated).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                type: item.type === 'NEWS' ? 'news' : 'article',
                category: item.category === 'NEWS' ? 'news' : 'articles',
                content: item.content,
                image: item.image ? `http://localhost:3000${item.image}` : null,
                views: item.views,
                tags: item.tags || [],
                slug: item.slug
            };

            this.renderNewsDetail();
            this.updateMetaTags();
            this.updateStructuredData();

            // Загружаем похожие новости
            this.loadRelatedNews();

            // Увеличиваем счетчик просмотров
            this.incrementViews();
        } catch (error) {
            console.error('Error loading news detail:', error);
            this.showError('Новость не найдена');
        }
    }

    async incrementViews() {
        try {
            await fetch(`http://localhost:3000/api/posts/${this.slug}/increment-views`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    renderNewsDetail() {
        const detailContainer = document.getElementById('newsDetail');
        if (!detailContainer || !this.newsData) return;

        const newsHtml = this.createNewsDetailHtml();
        detailContainer.innerHTML = newsHtml;

        // навешиваем обработчик на кнопку "Обсудить проект"
        const discussBtn = detailContainer.querySelector('.news-detail__cta .btn-primary');
        if (discussBtn && typeof openPopup === 'function') {
            discussBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openPopup();
            });
        }

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
                </div>
                <div class="news-detail__content">
                    <div class="news-detail__meta">
                        <div class="news-detail__date">${newsData.date}</div>
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
                        <button class="btn-primary" id="newsDiscussBtn">
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
                        <div class="news-detail__date">${newsData.date}</div>
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
                        <button class="btn-primary">
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
        if (publishedTime && newsData.rawDate) {
            const pubDate = new Date(newsData.rawDate);
            if (!isNaN(pubDate.getTime())) {
                publishedTime.setAttribute('content', pubDate.toISOString());
            }
        }

        // Modified time (устанавливаем как published для простоты)
        const modifiedTime = document.getElementById('news-modified-time');
        if (modifiedTime && newsData.rawDate) {
            const modDate = new Date(newsData.rawDate);
            if (!isNaN(modDate.getTime())) {
                modifiedTime.setAttribute('content', modDate.toISOString());
            }
        }
    }

    updateBreadcrumb() {
        const currentElement = document.getElementById('breadcrumb-current');
        if (currentElement) {
            currentElement.textContent = this.newsData.title;
        }
    }

    /**
     * Загружает похожие новости с API
     * Использует умный алгоритм подбора на основе:
     * 1. Совпадающих тегов (main priority)
     * 2. Типа/категории контента
     * 3. Свежести по дате
     * 4. Популярности по просмотрам
     */
    async loadRelatedNews() {
        if (!this.newsData) return;

        try {
            // Запрашиваем все посты с API
            const response = await fetch('http://localhost:3000/api/posts');
            if (!response.ok) throw new Error('Failed to fetch posts');

            const allPosts = await response.json();

            // 1. Исключаем текущую новость
            const candidates = allPosts.filter(post => post.id !== this.newsData.id);

            // 2. Считаем оценку похожести для каждого кандидата
            const scoredCandidates = candidates.map(post => {
                const transformedPost = this.transformPostData(post);
                const similarityScore = this.calculateSimilarityScore(this.newsData, transformedPost);
                return {
                    ...transformedPost,
                    similarityScore
                };
            });

            // 3. Сортируем по комбинации факторов:
            //    - Оценка похожести (desc)
            //    - Дата публикации (desc - свежее лучше)
            //    - Просмотры (desc - популярнее лучше)
            scoredCandidates.sort((a, b) => {
                // Сначала по оценке похожести
                if (b.similarityScore !== a.similarityScore) {
                    return b.similarityScore - a.similarityScore;
                }

                // Затем по дате (свежее лучше)
                const dateA = new Date(a.rawDate);
                const dateB = new Date(b.rawDate);
                if (dateB.getTime() !== dateA.getTime()) {
                    return dateB.getTime() - dateA.getTime();
                }

                // Наконец по просмотрам (популярнее лучше)
                return (b.views || 0) - (a.views || 0);
            });

            // 4. Берем топ-4 самых релевантных
            this.relatedNews = scoredCandidates.slice(0, 4);

            // 5. Рендерим карточки
            this.renderRelatedNews();

        } catch (error) {
            console.error('Error loading related news:', error);
            // В случае ошибки просто не показываем блок похожих новостей
        }
    }

    /**
     * Вычисляет оценку похожести между текущей новостью и кандидатом.
     * 
     * Правила оценки (можно настроить здесь):
     * - За каждый совпадающий тег: +10 баллов
     * - За совпадение типа (news/article): +5 баллов
     * - За совпадение категории: +3 балла
     * 
     * Чем больше баллов, тем более похожа новость.
     * 
     * @param {Object} current - Текущая новость
     * @param {Object} candidate - Кандидат для сравнения
     * @returns {number} - Оценка похожести
     */
    calculateSimilarityScore(current, candidate) {
        let score = 0;

        // 1. Проверяем совпадение тегов (наивысший приоритет)
        const currentTags = current.tags || [];
        const candidateTags = candidate.tags || [];

        // Находим общие теги
        const commonTags = currentTags.filter(tag =>
            candidateTags.includes(tag)
        );

        // За каждый общий тег добавляем 10 баллов
        // Можно изменить множитель для большего/меньшего влияния тегов
        score += commonTags.length * 10;

        // 2. Проверяем совпадение типа контента (средний приоритет)
        if (current.type === candidate.type) {
            // Можно изменить на другое значение для регулировки веса
            score += 5;
        }

        // 3. Проверяем совпадение категории (низкий приоритет)
        if (current.category === candidate.category) {
            // Можно изменить на другое значение для регулировки веса
            score += 3;
        }

        return score;
    }

    /**
     * Преобразует данные поста с API в формат для фронтенда
     * @param {Object} item - Объект поста с API
     * @returns {Object} - Преобразованный объект
     */
    transformPostData(item) {
        return {
            id: item.id,
            title: item.title,
            rawDate: item.datePublished || item.dateCreated,
            date: new Date(item.datePublished || item.dateCreated).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            type: item.type === 'NEWS' ? 'news' : 'article',
            category: item.category === 'NEWS' ? 'news' : 'articles',
            content: item.content,
            image: item.image ? `http://localhost:3000${item.image}` : null,
            views: item.views,
            tags: item.tags || [],
            slug: item.slug
        };
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
        cardDiv.className = `news-card news-card--${newsItem.type}`;
        cardDiv.setAttribute('data-id', newsItem.id);

        let cardContent = '';

        if (newsItem.type === 'news' && newsItem.image) {
            // Карточка новости с изображением - точно как на главной странице
            cardContent = `
                <div class="news-card__image">
                    <img src="${newsItem.image}" alt="${newsItem.title}">
                </div>
                <div class="news-card__content">
                    <div class="news-card__date">${newsItem.date}</div>
                    <h3 class="news-card__title">${newsItem.title}</h3>
                    <div class="news-card__tags">
                        ${newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            // Карточка статьи или акции (только текст) - точно как на главной странице
            const truncatedContent = this.truncateTextByLines(newsItem.content, 4);

            cardContent = `
                <div class="news-card__content">
                    <div class="news-card__date">${newsItem.date}</div>
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
            window.location.href = `news-detail.html?slug=${newsItem.slug}`;
        });

        return cardDiv;
    }

    // Функция для обрезки текста по количеству строк - точно как на главной странице
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

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).replace(/\s+\w*$/, '') + '...';
    }

    updateStructuredData() {
        const structuredDataElement = document.getElementById('newsStructuredData');
        if (!structuredDataElement || !this.newsData) return;

        const { newsData } = this;
        const currentUrl = `https://statusdesign.ru/news-detail.html?slug=${newsData.slug}`;

        // Валидация даты
        let publishedDate = new Date(newsData.rawDate);
        let publishedISO = null;
        if (!isNaN(publishedDate.getTime())) {
            publishedISO = publishedDate.toISOString();
        }

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": newsData.title,
            "description": newsData.content.substring(0, 200) + '...',
            "image": newsData.image ? newsData.image : "https://statusdesign.ru/img/news_img_1.png",
            "datePublished": publishedISO,
            "dateModified": publishedISO,
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