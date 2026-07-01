import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndex = resolve(__dirname, '../dist/index.html');
const distShell = resolve(__dirname, '../dist/_shell.html');

// Conserver une copie avec les tokens bruts pour render.js
copyFileSync(distIndex, distShell);

const SITE_NAME = 'Legging Express';
const SITE_ORIGIN = 'https://www.leggingexpress.com';

const meta = {
  'META_TITLE': `${SITE_NAME} — Find Your Perfect Leggings`,
  'META_DESCRIPTION': 'Shop the best leggings, biker shorts, yoga pants and activewear for women. Compare ratings, prices and bestsellers from top brands on Amazon CA and US.',
  'META_OG_TITLE': `${SITE_NAME} — Find Your Perfect Leggings`,
  'META_OG_DESCRIPTION': 'Shop the best leggings, biker shorts, yoga pants and activewear for women. Compare ratings, prices and bestsellers from top brands on Amazon CA and US.',
  'META_OG_IMAGE': `${SITE_ORIGIN}/og-default.jpg`,
  'META_OG_URL': SITE_ORIGIN,
  'META_CANONICAL_URL': SITE_ORIGIN,
  'META_JSON_LD': `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: 'Shop the best leggings, biker shorts, yoga pants and activewear for women on Amazon CA and US.',
  })}</script>`,
};

let html = readFileSync(distIndex, 'utf-8');
for (const [token, value] of Object.entries(meta)) {
  html = html.replaceAll(token, value);
}
writeFileSync(distIndex, html, 'utf-8');
console.log('Homepage meta injected into dist/index.html');
console.log('Raw shell saved to dist/_shell.html');
