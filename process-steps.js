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

    // Добавляем плавные анимации для появления деталей
    const style = document.createElement('style');
    style.textContent = `
        .process-step {
            position: relative;
        }

        .process-step.hovered::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #0B0D10;
            border-radius: 10px;
            padding: 30px;
            margin-top: 10px;
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            transition: all 0.3s ease;
            z-index: 10;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            min-height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .process-step.hovered[data-step="01"]::after {
            content: 'Прием автомобиля включает: диагностику текущего состояния, фотофиксацию, оценку объема работ';
        }

        .process-step.hovered[data-step="02"]::after {
            content: 'Шумоизоляция проводится с использованием премиальных материалов COMFORTMAT, многослойная обработка всех зон';
        }

        .process-step.hovered[data-step="03"]::after {
            content: 'Сборка автомобиля: контроль качества, финальная проверка, подготовка документации';
        }

        .process-step.hovered[data-step="04"]::after {
            content: 'Сдача владельцу: отчет о проведенных работах, выдача акта о предоставлении услуг, гарантия на проделанную работу';
        }

        .process-step.hovered::after {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 140%;
            color: rgba(255, 255, 255, 0.9);
            text-align: left;
        }
    `;
    document.head.appendChild(style);

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
