const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const imgDir = path.resolve(__dirname, 'img');
const output = {};

function getDimensions(filePath) {
    try {
        const escapedPath = filePath.replace(/\\/g, '\\\\');
        const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${escapedPath}"`;
        const result = execSync(cmd).toString().trim();
        const [width, height] = result.split('x');
        if (width && height) {
            return { width: parseInt(width), height: parseInt(height) };
        }
    } catch (e) {
        // Skip silently for things that aren't images or if ffprobe fails
    }
    return null;
}

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (item.toLowerCase().endsWith('.webp')) {
            const relPath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
            const dims = getDimensions(fullPath);
            if (dims) {
                output[relPath] = dims;
            }
        }
    }
}

try {
    processDir(imgDir);
    fs.writeFileSync('image-dimensions.json', JSON.stringify(output, null, 2));
    console.log(`Saved dimensions for ${Object.keys(output).length} images to image-dimensions.json`);
} catch (err) {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
}
