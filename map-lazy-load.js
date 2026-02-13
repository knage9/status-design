document.addEventListener('DOMContentLoaded', () => {
    const mapContainers = document.querySelectorAll('.map-container');

    mapContainers.forEach(container => {
        const iframe = container.querySelector('iframe');
        const showBtn = container.querySelector('.show-map-btn');
        const placeholder = container.querySelector('.map-placeholder');

        if (!iframe) return;

        const loadMap = () => {
            if (iframe.getAttribute('src')) return;

            const src = iframe.getAttribute('data-src');
            if (src) {
                iframe.setAttribute('src', src);
                iframe.style.display = 'block';
                if (placeholder) {
                    placeholder.classList.add('map-placeholder--hidden');
                    setTimeout(() => {
                        placeholder.style.display = 'none';
                    }, 500);
                }
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMap();
                observer.disconnect();
            }
        }, {
            rootMargin: '100px'
        });

        if (showBtn) {
            showBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loadMap();
                observer.disconnect();
            });
        }

        observer.observe(container);
    });
});
