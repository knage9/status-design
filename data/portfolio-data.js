// Данные портфолио работ Status Design
// Структура данных для админки - легко редактировать и добавлять новые работы

const PORTFOLIO_DATA = [
    // Mercedes-Benz работы
    {
        id: 1,
        title: "Mercedes-Benz S-Class - Полный антихром",
        carBrand: "Mercedes-Benz",
        carModel: "S-Class W223",
        services: ["Антихром", "Шумоизоляция"],
        mainImage: "img/portfolio/mercedes-s-class-1.jpg",
        gallery: [
            "img/portfolio/mercedes-s-class-1.jpg",
            "img/portfolio/mercedes-s-class-2.jpg",
            "img/portfolio/mercedes-s-class-3.jpg"
        ],
        description: "Полная замена всех хромированных элементов на черные глянцевые + премиальная шумоизоляция салона. Результат - элегантный и современный вид автомобиля премиум-класса.",
        date: "2024-01-15",
        featured: true,
        views: 245
    },
    {
        id: 2,
        title: "Mercedes-Benz GLE - Карбон и антихром",
        carBrand: "Mercedes-Benz",
        carModel: "GLE Coupe",
        services: ["Карбон", "Антихром"],
        mainImage: "img/portfolio/mercedes-gle-1.jpg",
        gallery: [
            "img/portfolio/mercedes-gle-1.jpg",
            "img/portfolio/mercedes-gle-2.jpg"
        ],
        description: "Установка карбоновых элементов обвеса и замена хрома на черный глянец. Автомобиль получил спортивный и агрессивный характер.",
        date: "2024-01-12",
        featured: true,
        views: 189
    },
    {
        id: 3,
        title: "Mercedes-Benz GLS Maybach - Премиум шумоизоляция",
        carBrand: "Mercedes-Benz",
        carModel: "GLS Maybach",
        services: ["Шумоизоляция", "Антихром"],
        mainImage: "img/portfolio/mercedes-gls-1.jpg",
        gallery: [
            "img/portfolio/mercedes-gls-1.jpg",
            "img/portfolio/mercedes-gls-2.jpg",
            "img/portfolio/mercedes-gls-3.jpg"
        ],
        description: "Премиальная шумоизоляция салона автомобиля Maybach. Использованы лучшие материалы для достижения максимального комфорта в поездках.",
        date: "2024-01-10",
        featured: false,
        views: 156
    },

    // BMW работы
    {
        id: 4,
        title: "BMW X7 - Полный карбоновый обвес",
        carBrand: "BMW",
        carModel: "X7",
        services: ["Карбон", "Антихром"],
        mainImage: "img/portfolio/bmw-x7-1.jpg",
        gallery: [
            "img/portfolio/bmw-x7-1.jpg",
            "img/portfolio/bmw-x7-2.jpg",
            "img/portfolio/bmw-x7-3.jpg"
        ],
        description: "Установка полного карбонового обвеса M-Performance и замена всех хромированных элементов. Автомобиль стал настоящим спорткаром.",
        date: "2024-01-08",
        featured: true,
        views: 203
    },
    {
        id: 5,
        title: "BMW M5 Competition - Спорт-карбон",
        carBrand: "BMW",
        carModel: "M5 Competition",
        services: ["Карбон"],
        mainImage: "img/portfolio/bmw-m5-1.jpg",
        gallery: [
            "img/portfolio/bmw-m5-1.jpg",
            "img/portfolio/bmw-m5-2.jpg"
        ],
        description: "Установка карбоновых элементов экстерьера для BMW M5 Competition. Подчеркнуты спортивные характеристики автомобиля.",
        date: "2024-01-05",
        featured: false,
        views: 167
    },

    // Audi работы
    {
        id: 6,
        title: "Audi RS7 - Черный антихром",
        carBrand: "Audi",
        carModel: "RS7",
        services: ["Антихром", "Керамика"],
        mainImage: "img/portfolio/audi-rs7-1.jpg",
        gallery: [
            "img/portfolio/audi-rs7-1.jpg",
            "img/portfolio/audi-rs7-2.jpg",
            "img/portfolio/audi-rs7-3.jpg"
        ],
        description: "Полная замена хромированных элементов на черные матовые + нанесение керамического покрытия. Автомобиль получил агрессивный спортивный вид.",
        date: "2024-01-03",
        featured: true,
        views: 234
    },

    // Porsche работы
    {
        id: 7,
        title: "Porsche Cayenne Turbo GT - Премиум тюнинг",
        carBrand: "Porsche",
        carModel: "Cayenne Turbo GT",
        services: ["Антихром", "Карбон", "Шумоизоляция"],
        mainImage: "img/portfolio/porsche-cayenne-1.jpg",
        gallery: [
            "img/portfolio/porsche-cayenne-1.jpg",
            "img/portfolio/porsche-cayenne-2.jpg"
        ],
        description: "Комплексный тюнинг Porsche Cayenne: антихром, карбоновые элементы и премиальная шумоизоляция салона.",
        date: "2024-01-01",
        featured: true,
        views: 198
    },

    // Lexus работы
    {
        id: 8,
        title: "Lexus LX 600 - Вип шумоизоляция",
        carBrand: "Lexus",
        carModel: "LX 600",
        services: ["Шумоизоляция", "Антихром"],
        mainImage: "img/portfolio/lexus-lx-1.jpg",
        gallery: [
            "img/portfolio/lexus-lx-1.jpg",
            "img/portfolio/lexus-lx-2.jpg",
            "img/portfolio/lexus-lx-3.jpg"
        ],
        description: "Премиальная шумоизоляция салона Lexus LX 600 с использованием лучших материалов. Максимальный комфорт для пассажиров VIP-класса.",
        date: "2023-12-28",
        featured: false,
        views: 145
    },

    // Другие марки
    {
        id: 9,
        title: "Range Rover Sport - Карбон и антихром",
        carBrand: "Land Rover",
        carModel: "Range Rover Sport",
        services: ["Карбон", "Антихром"],
        mainImage: "img/portfolio/range-rover-1.jpg",
        gallery: [
            "img/portfolio/range-rover-1.jpg",
            "img/portfolio/range-rover-2.jpg"
        ],
        description: "Установка карбоновых элементов и замена хрома для Range Rover Sport. Автомобиль получил современный и стильный внешний вид.",
        date: "2023-12-25",
        featured: false,
        views: 123
    },
    {
        id: 10,
        title: "Tesla Model S Plaid - Антихром",
        carBrand: "Tesla",
        carModel: "Model S Plaid",
        services: ["Антихром"],
        mainImage: "img/portfolio/tesla-models-1.jpg",
        gallery: [
            "img/portfolio/tesla-models-1.jpg",
            "img/portfolio/tesla-models-2.jpg"
        ],
        description: "Замена хромированных элементов на черные матовые для Tesla Model S Plaid. Электромобиль получил более агрессивный и современный вид.",
        date: "2023-12-20",
        featured: false,
        views: 178
    },

    // Дополнительные работы для демонстрации фильтров
    {
        id: 11,
        title: "BMW 7 Series - Шумоизоляция премиум",
        carBrand: "BMW",
        carModel: "7 Series",
        services: ["Шумоизоляция"],
        mainImage: "img/portfolio/bmw-7-1.jpg",
        gallery: [
            "img/portfolio/bmw-7-1.jpg",
            "img/portfolio/bmw-7-2.jpg"
        ],
        description: "Премиальная шумоизоляция салона BMW 7 Series. Использованы лучшие материалы для достижения максимального комфорта.",
        date: "2023-12-18",
        featured: false,
        views: 134
    },
    {
        id: 12,
        title: "Audi A8 - Полный карбон",
        carBrand: "Audi",
        carModel: "A8",
        services: ["Карбон"],
        mainImage: "img/portfolio/audi-a8-1.jpg",
        gallery: [
            "img/portfolio/audi-a8-1.jpg",
            "img/portfolio/audi-a8-2.jpg",
            "img/portfolio/audi-a8-3.jpg"
        ],
        description: "Установка карбоновых элементов на Audi A8. Автомобиль получил спортивный характер и улучшенные аэродинамические характеристики.",
        date: "2023-12-15",
        featured: false,
        views: 156
    }
];

// Функция для получения всех уникальных марок автомобилей
function getAllCarBrands() {
    const brands = [...new Set(PORTFOLIO_DATA.map(item => item.carBrand))];
    return brands.sort();
}

// Функция для получения всех уникальных услуг
function getAllServices() {
    const services = [...new Set(PORTFOLIO_DATA.flatMap(item => item.services))];
    return services.sort();
}

// Функция для получения работ для главной страницы (featured)
function getFeaturedPortfolio() {
    return PORTFOLIO_DATA.filter(item => item.featured)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
}

// Функция для получения данных по ID
function getPortfolioById(id) {
    return PORTFOLIO_DATA.find(item => item.id === parseInt(id));
}

// Функция для форматирования даты
function formatPortfolioDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'Сегодня';
    } else if (diffDays === 2) {
        return 'Вчера';
    } else if (diffDays <= 7) {
        return `${diffDays} дней назад`;
    } else {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}
