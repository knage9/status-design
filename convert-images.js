// Image conversion script using PowerShell and built-in Windows tools
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const imgDir = path.join(__dirname, 'img');

// Get all image files recursively
function getAllImages(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllImages(filePath, fileList);
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

const images = getAllImages(imgDir);
console.log(`Found ${images.length} images to convert`);

// Create a list for manual conversion
const conversionList = images.map(img => {
    const webpPath = img.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return { original: img, webp: webpPath };
});

// Save conversion list
fs.writeFileSync(
    path.join(__dirname, 'image-conversion-list.json'),
    JSON.stringify(conversionList, null, 2)
);

console.log('Image conversion list saved to image-conversion-list.json');
console.log('\nPlease use an online tool or image editor to convert these images to WebP format.');
console.log('Recommended tools:');
console.log('- https://convertio.co/jpg-webp/');
console.log('- https://cloudconvert.com/jpg-to-webp');
console.log('- Or use Photoshop/GIMP to batch convert');
