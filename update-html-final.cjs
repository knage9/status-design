const fs = require('fs');
const path = require('path');

const dimensions = JSON.parse(fs.readFileSync('image-dimensions.json', 'utf8'));

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

function updateHtml(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update Scripts in head (add defer except for metrika.js)
    content = content.replace(/<head>([\s\S]*?)<\/head>/i, (headMatch, headContent) => {
        return '<head>' + headContent.replace(/<script([^>]+src=["'](?!.*metrika\.js)[^"']+["'])([^>]*)>/gi, (scriptMatch, attrs, suffix) => {
            if (attrs.includes('defer') || suffix.includes('defer')) {
                return scriptMatch;
            }
            return `<script${attrs} defer${suffix}>`;
        }) + '</head>';
    });

    // 2. Update Image tags
    // This regex tries to capture img tag and its attributes
    content = content.replace(/<img([^>]+)>/gi, (imgMatch, attrs) => {
        let newAttrs = attrs;

        // a. Replace extension with webp if it's in img/
        newAttrs = newAttrs.replace(/(src=["'])(img\/[^"']+\.(jpg|jpeg|png|JPG|JPEG|PNG))(["'])/gi, (match, prefix, src, ext, suffix) => {
            return prefix + src.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp') + suffix;
        });

        // Get updated src
        const srcMatch = newAttrs.match(/src=["']([^"']+)["']/i);
        const src = srcMatch ? srcMatch[1] : null;

        if (src && dimensions[src]) {
            const dim = dimensions[src];
            // b. Add width and height if not present
            if (!newAttrs.includes('width=')) {
                newAttrs += ` width="${dim.width}"`;
            }
            if (!newAttrs.includes('height=')) {
                newAttrs += ` height="${dim.height}"`;
            }

            // c. Add loading="lazy" if not hero/background and not already present
            const isHero = /hero|background|Фон/i.test(newAttrs) || /hero|background|Фон/i.test(imgMatch) || content.substring(content.indexOf(imgMatch) - 500, content.indexOf(imgMatch)).includes('hero');
            // Simplified check: if it's within the first 2000 chars of body, it might be hero. 
            // Better: search for hero keywords in the tag or the immediate surroundings in content.

            if (!isHero && !newAttrs.includes('loading=')) {
                newAttrs += ' loading="lazy"';
            }
        }

        return `<img${newAttrs}>`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

htmlFiles.forEach(file => {
    updateHtml(file);
});

console.log('All HTML files updated successfully.');
