import sharp from 'sharp';
import fs from 'fs';

const inputPath = '/Users/arjun/.gemini/antigravity/brain/81c34cc2-874c-4031-a8bb-ccb68a8713d2/mppsc_og_hero_1781439889770.png';
const outputPath = './public/og-hero.webp';

if (fs.existsSync(inputPath)) {
  sharp(inputPath)
    .resize(1200, 630)
    .webp({ quality: 90 })
    .toFile(outputPath)
    .then(() => console.log('Successfully updated og-hero.webp!'))
    .catch(err => console.error('Error:', err));
} else {
  console.error('Input file not found:', inputPath);
}
