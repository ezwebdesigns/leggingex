import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndex = resolve(__dirname, '../dist/index.html');

const SITE_NAME = 'Legging Express';
const SITE_ORIGIN = 'https://www.leggingexpress.com';

const meta = {
  '__TITLE__': `${SITE_NAME} — Find Your Perfect Leggings`,
  '__DESCRIPTION__': 'Shop the best leggings, biker shorts, yoga pants and activewear for women. Compare ratings, prices and bestsellers from top brands on Amazon CA and US.',
  '__OG_TITLE__': `${SITE_NAME} — Find Your Perfect Leggings`,
  '__OG_DESCRIPTION__': 'Shop the best leggings, biker shorts, yoga pants and activewear for women. Compare ratings, prices and bestsellers from top brands on Amazon CA and US.',
  '__OG_IMAGE__': `${SITE_ORIGIN}/og-default.jpg`,
  '__OG_URL__': SITE_ORIGIN,
  '__CANONICAL_URL__': SITE_ORIGIN,
  '__JSON_LD__': '',
};

let html = readFileSync(distIndex, 'utf-8');
for (const [token, value] of Object.entries(meta)) {
  html = html.replaceAll(token, value);
}
writeFileSync(distIndex, html, 'utf-8');
console.log('Homepage meta injected into dist/index.html');
