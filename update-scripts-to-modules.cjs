const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'antichrome.html',
    'carbon.html',
    'contacts.html',
    'portfolio.html',
    'reviews.html',
    'services.html',
    'shum.html',
    'news.html',
    'news-detail.html',
    'privacy.html'
];

function updateScriptsToModules(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Add type="module" to all scripts that have a src attribute and don't already have it
    content = content.replace(/<script([^>]+src=["'][^"']+["'])([^>]*)>/gi, (match, attrs, suffix) => {
        if (attrs.includes('type=') || suffix.includes('type=')) {
            return match;
        }
        return `<script${attrs} type="module"${suffix}>`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated scripts in ${filePath}`);
}

htmlFiles.forEach(file => {
    updateScriptsToModules(file);
});

console.log('All script tags updated to type="module".');
