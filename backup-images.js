const fs = require('fs');
const path = require('path');

// Create backup directory
const backupDir = path.join(__dirname, 'img-backup');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Function to get all image files recursively
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

// Get all images
const imgDir = path.join(__dirname, 'img');
const images = getAllImages(imgDir);

console.log(`Found ${images.length} images to process`);

// Create backup and prepare conversion list
const conversionList = [];

images.forEach(imagePath => {
    const relativePath = path.relative(imgDir, imagePath);
    const backupPath = path.join(backupDir, relativePath);
    const backupFolder = path.dirname(backupPath);

    // Create backup folder structure
    if (!fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder, { recursive: true });
    }

    // Copy to backup if not exists
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(imagePath, backupPath);
        console.log(`Backed up: ${relativePath}`);
    }

    // Add to conversion list
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    conversionList.push({
        original: imagePath,
        webp: webpPath,
        relative: relativePath
    });
});

// Save conversion list
fs.writeFileSync(
    path.join(__dirname, 'image-conversion-list.json'),
    JSON.stringify(conversionList, null, 2)
);

console.log(`\n✓ Backed up ${images.length} images to img-backup/`);
console.log(`✓ Created image-conversion-list.json`);
console.log(`\nNext steps:`);
console.log(`1. Convert images using online tool: https://convertio.co/jpg-webp/`);
console.log(`2. Or install FFmpeg: winget install ffmpeg`);
console.log(`3. Then run: node update-html-images.js`);
