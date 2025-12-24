// Process Steps Hover Effects
document.addEventListener('DOMContentLoaded', function() {
    const processSteps = document.querySelectorAll('.process-step');

    processSteps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            // Добавляем hover класс для стилизации
            this.classList.add('hovered');
        });

        step.addEventListener('mouseleave', function() {
            // Убираем hover класс
            this.classList.remove('hovered');
        });
    });

    // Добавляем data-атрибуты для шагов
    const stepsWithData = [
        { selector: '.process-step:nth-child(1)', step: '01' },
        { selector: '.process-step:nth-child(2)', step: '02' },
        { selector: '.process-step:nth-child(3)', step: '03' },
        { selector: '.process-step:nth-child(4)', step: '04' }
    ];

    stepsWithData.forEach(({ selector, step }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute('data-step', step);
        }
    });
});
