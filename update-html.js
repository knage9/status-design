const fs = require('fs');
const path = require('path');

// HTML files to update
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

// Hero section patterns - images that should NOT have lazy loading
const heroPatterns = [
    'Фон.png',
    'Фон.webp',
    'hero',
    'background'
];

function isHeroImage(imgTag) {
    return heroPatterns.some(pattern => imgTag.toLowerCase().includes(pattern.toLowerCase()));
}

function updateHtmlFile(filePath) {
    console.log(`\nProcessing: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found, skipping`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;

    // 1. Replace .jpg, .jpeg, .png with .webp in img tags
    content = content.replace(/(<img[^>]+src=["'])([^"']+\.(jpg|jpeg|png|JPG|JPEG|PNG))(["'][^>]*>)/gi, (match, prefix, imagePath, ext, suffix) => {
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
        changes++;
        return prefix + webpPath + suffix;
    });

    // 2. Add loading="lazy" to img tags (except hero images and those already having it)
    content = content.replace(/<img([^>]*?)>/gi, (match, attrs) => {
        // Skip if already has loading attribute
        if (/loading\s*=/.test(attrs)) {
            return match;
        }

        // Skip if it's a hero image
        if (isHeroImage(match)) {
            return match;
        }

        // Add loading="lazy"
        changes++;
        return `<img${attrs} loading="lazy">`;
    });

    // 3. Add defer to script tags that don't have it (except metrika.js)
    content = content.replace(/<script([^>]+src=["'][^"']+["'][^>]*)>/gi, (match, attrs) => {
        // Skip if already has defer
        if (/defer/.test(attrs)) {
            return match;
        }

        // Skip if it's metrika.js
        if (/metrika\.js/.test(attrs)) {
            return match;
        }

        // Add defer
        changes++;
        return `<script${attrs} defer>`;
    });

    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Updated with ${changes} changes`);
}

console.log('Starting HTML files update...\n');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    updateHtmlFile(filePath);
});

console.log('\n✓ All HTML files updated!');
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. Check console for errors');
console.log('3. Verify: typeof ym === "function"');
