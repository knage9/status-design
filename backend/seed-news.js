const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Instead of importing the JS file (which might have issues in node), 
// I'll just copy the data here to be safe
const NEWS_DATA = [
    {
        type: 'NEWS',
        title: 'Шумоизоляция вашего авто — теперь за 1 день!',
        image: 'img/news_img_1.png',
        category: 'NEWS',
        date: '2024-01-15',
        excerpt: 'Ищете где быстро сделать шумоизоляцию вашего автомобиля? Теперь мы предлагаем услугу шумоизоляции за 1 день без потери качества услуги!',
        content: 'Ищете где быстро сделать шумоизоляцию вашего автомобиля? Теперь мы предлагаем услугу шумоизоляции за 1 день без потери качества услуги! Наши мастера используют только профессиональные материалы и современное оборудование для достижения идеального результата.',
        tags: ['Новости'],
        slug: 'shumoizolyaciya-1-day'
    },
    {
        type: 'NEWS',
        title: 'Антихром — современное решение для автомобиля',
        image: 'img/news_img_2.png',
        category: 'NEWS',
        date: '2024-01-12',
        excerpt: 'Антихром становится всё популярнее среди владельцев премиальных автомобилей. Это решение позволяет изменить внешний вид хромированных элементов.',
        content: 'Антихром становится всё популярнее среди владельцев премиальных автомобилей. Это решение позволяет изменить внешний вид хромированных элементов, сделав автомобиль более стильным и современным. Узнайте о преимуществах этого решения.',
        tags: ['Новости'],
        slug: 'antihrome-solution'
    },
    {
        type: 'NEWS',
        title: 'Расширение услуг: теперь доступны все марки BMW',
        image: 'img/news_img_1.png',
        category: 'NEWS',
        date: '2024-01-10',
        excerpt: 'Мы рады сообщить, что теперь выполняем работы по тюнингу для всех моделей BMW, включая последние новинки.',
        content: 'Мы рады сообщить, что теперь выполняем работы по тюнингу для всех моделей BMW, включая последние новинки. Наши специалисты прошли специальное обучение и имеют опыт работы с автомобилями этой марки.',
        tags: ['Новости'],
        slug: 'bmw-all-models'
    },
    {
        type: 'NEWS',
        title: 'Новые материалы для карбонового тюнинга',
        image: 'img/news_img_2.png',
        category: 'NEWS',
        date: '2024-01-08',
        excerpt: 'В наш ассортимент добавлены премиальные карбоновые материалы от ведущих мировых производителей.',
        content: 'В наш ассортимент добавлены премиальные карбоновые материалы от ведущих мировых производителей. Теперь мы можем предложить еще больше вариантов для создания уникального внешнего вида вашего автомобиля.',
        tags: ['Новости'],
        slug: 'new-carbon-materials'
    }
];

async function main() {
    console.log('Starting seed...');
    for (const item of NEWS_DATA) {
        try {
            const { date, ...itemData } = item;
            await prisma.post.upsert({
                where: { slug: item.slug },
                update: {},
                create: {
                    ...itemData,
                    status: 'PUBLISHED',
                    datePublished: new Date(date)
                }
            });
            console.log(`Imported: ${item.title}`);
        } catch (err) {
            console.error(`Error importing ${item.title}:`, err.message);
        }
    }
    console.log('Seed finished!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
