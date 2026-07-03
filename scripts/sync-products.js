import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const FEED_URL = process.env.PARTNERIZE_FEED_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Paires marketplace/devise autorisées. Un produit est inclus si SA paire
// exacte (Marketplace + Currency) correspond à une de celles-ci — ça évite
// d'inclure par erreur un listing amazon.ca facturé en USD, par exemple.
const ALLOWED_MARKET_CURRENCY_PAIRS = [
  { marketplace: 'amazon.ca', currency: 'CAD' },
  { marketplace: 'amazon.com', currency: 'USD' },
];

function isAllowedMarketCurrency(marketplace, currency) {
  return ALLOWED_MARKET_CURRENCY_PAIRS.some(
    (pair) => pair.marketplace === marketplace && pair.currency === currency
  );
}

// Mots-clés à matcher dans "Product Name" OU "Category" (insensible à la casse,
// recherche en sous-chaîne : "legging" matche aussi "leggings").
const KEYWORDS = [
  'legging',
  'biker short',
  'cycling short',
  'yoga pant',
  'waist trainer',
  'shapewear',
  'thigh short',
  'flare legging',
  'capri legging',
];

const BATCH_SIZE = 500; // taille des lots envoyés à Supabase par appel upsert

// Règles de catégorisation : cherchées uniquement dans "Product Name".
// Toutes les "phrases" d'une règle doivent être présentes (logique ET) pour
// que le produit soit tagué avec le label correspondant. Un produit peut
// matcher plusieurs catégories à la fois (ex: "High Waisted Workout Leggings").
const CATEGORY_RULES = [
  { label: 'Biker Shorts', phrases: ['biker', 'short'] },
  { label: 'Cycling Shorts', phrases: ['cycling', 'short'] },
  { label: 'Yoga Pants', phrases: ['yoga', 'pant'] },
  { label: 'High Waisted Leggings', phrases: ['high waist', 'legging'] },
  { label: 'High Waisted Shorts', phrases: ['high waist', 'short'] },
  { label: 'Gym Shorts', phrases: ['gym', 'short'] },
  { label: 'Gym Leggings', phrases: ['gym', 'legging'] },
  { label: 'Booty Shorts', phrases: ['booty', 'short'] },
  { label: 'Booty Leggings', phrases: ['booty', 'legging'] },
  { label: 'Plus Size Leggings', phrases: ['plus size', 'legging'] },
  { label: 'Plus Size Shorts', phrases: ['plus size', 'short'] },
  { label: 'Workout Shorts', phrases: ['workout', 'short'] },
  { label: 'Workout Leggings', phrases: ['workout', 'legging'] },
  { label: 'Pack', phrases: ['pack'] },
  { label: 'Leather Leggings', phrases: ['leather', 'legging'] },
  { label: 'Fashion Leggings', phrases: ['fashion', 'legging'] },
  { label: 'Cropped Leggings', phrases: ['crop', 'legging'] },
  { label: 'Waist Trainer', phrases: ['waist trainer'] },
  { label: 'Shapewear', phrases: ['shapewear'] },
  { label: 'Thigh Shorts', phrases: ['thigh', 'short'] },
  { label: 'Flare Leggings', phrases: ['flare', 'legging'] },
  { label: 'Capri Leggings', phrases: ['capri', 'legging'] },
  { label: 'Fleece Leggings', phrases: ['fleece', 'legging'] },
  { label: 'Black Leggings', phrases: ['black', 'legging'] },
  { label: 'Scrunch Shorts', phrases: ['scrunch', 'short'] },
  { label: 'Leggings with Pockets', phrases: ['pocket', 'legging'] },
];

if (!FEED_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Variables d'environnement manquantes : PARTNERIZE_FEED_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY sont requises."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------------
// Helpers de conversion / nettoyage
// ---------------------------------------------------------------------------

function toNumberOrNull(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toIntOrNull(value) {
  const n = toNumberOrNull(value);
  return n === null ? null : Math.trunc(n);
}

function toIsoDateOrNull(value) {
  if (!value || String(value).trim() === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function matchesKeywords(productName, category) {
  const haystack = `${productName ?? ''} ${category ?? ''}`.toLowerCase();
  return KEYWORDS.some((kw) => haystack.includes(kw.toLowerCase()));
}

// Amazon renvoie une image placeholder générique ("no image available") quand
// le vrai visuel manque, plutôt qu'une URL vide — il faut donc la détecter
// explicitement. L'identifiant "01RmK+J4pJL" est commun à ce placeholder sur
// tout le catalogue Amazon, quel que soit le marketplace ou le suffixe de
// taille (_AC_, _AC_SL1500_, etc.) ou l'encodage du "+" (%2B, +, ou rien).
function isPlaceholderImage(url) {
  if (!url || url.trim() === '') return true;
  const normalized = url.toLowerCase().replace(/%2b/g, '').replace(/\+/g, '');
  return normalized.includes('01rmkj4pjl');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// \b au début de chaque mot (mais pas à la fin) pour autoriser les suffixes
// ("waist" matche aussi "waisted"), tout en évitant les faux positifs du
// type "backpack" qui contient "pack" sans frontière de mot avant lui.
// Le séparateur [\s-]+ gère aussi bien "High Waist" que "High-Waist".
function buildPhrasePattern(phrase) {
  const escaped = phrase
    .split(' ')
    .map((word) => escapeRegExp(word))
    .join('[\\s-]+');
  return new RegExp(`\\b${escaped}`, 'i');
}

const COMPILED_CATEGORY_RULES = CATEGORY_RULES.map((rule) => ({
  label: rule.label,
  patterns: rule.phrases.map(buildPhrasePattern),
}));

function computeCategories(title) {
  const text = title ?? '';
  return COMPILED_CATEGORY_RULES
    .filter((rule) => rule.patterns.every((pattern) => pattern.test(text)))
    .map((rule) => rule.label);
}

function mapRow(row, runTimestamp) {
  return {
    partnerize_id: row['id'],
    asin: row['ASIN'] || null,
    title: row['Product Name'] || null,
    image_url: row['Image URL'] || null,
    marketplace: row['Marketplace'] || null,
    price: toNumberOrNull(row['Price']),
    currency: row['Currency'] || null,
    commission: toNumberOrNull(row['Commission']),
    est_payout: toNumberOrNull(row['Est.Payout']),
    ratings_count: toIntOrNull(row['No. of Ratings']),
    rating: toNumberOrNull(row['Rating']),
    brand: row['Brand'] || null,
    category: row['Category'] || null,
    availability_raw: row['Availability'] || null,
    is_active: row['Availability'] === 'IN_STOCK',
    best_seller_rank: toIntOrNull(row['Best Seller Rank']),
    deal_start: toIsoDateOrNull(row['Deal Start']),
    deal_end: toIsoDateOrNull(row['Deal End']),
    deal_price: toNumberOrNull(row['Deal Price']),
    clippable_start: toIsoDateOrNull(row['Clippable Start']),
    clippable_end: toIsoDateOrNull(row['Clippable End']),
    clippable_price: toNumberOrNull(row['Clippable Price']),
    promo_code_start: toIsoDateOrNull(row['Promo Code Start']),
    promo_code_end: toIsoDateOrNull(row['Promo Code End']),
    promo_code_price: toNumberOrNull(row['Promo Code Price']),
    promo_code: row['Promo Code'] || null,
    affiliate_link: row['Attribution URL'] || null,
    categories: computeCategories(row['Product Name']),
    has_image: !isPlaceholderImage(row['Image URL']),
    last_seen_at: runTimestamp,
  };
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Script principal
// ---------------------------------------------------------------------------

async function main() {
  const runTimestamp = new Date().toISOString();
  console.log(`[${runTimestamp}] Démarrage de la synchronisation`);

  // 1. Téléchargement du feed
  const response = await fetch(FEED_URL);
  if (!response.ok) {
    throw new Error(`Échec du téléchargement du feed : ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();
  console.log(`Feed téléchargé (${csvText.length} caractères)`);

  // 2. Parsing du CSV (détecte automatiquement virgule ou tabulation comme séparateur)
  const delimiter = csvText.split('\n')[0].includes('\t') ? '\t' : ',';
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter,
  });
  console.log(`${rows.length} lignes dans le feed brut (délimiteur détecté : "${delimiter === '\t' ? '\\t' : delimiter}")`);

  // 3. Filtrage : marketplace, devise, mots-clés, et présence d'un id exploitable
  const filtered = rows.filter((row) => {
    return (
      isAllowedMarketCurrency(row['Marketplace'], row['Currency']) &&
      matchesKeywords(row['Product Name'], row['Category']) &&
      row['id']
    );
  });
  console.log(`${filtered.length} lignes après filtrage (marketplace/devise/mots-clés)`);

  if (filtered.length === 0) {
    console.warn('Aucun produit ne correspond aux filtres pour ce run. Vérifie les filtres ou le feed avant de creuser plus loin.');
    return;
  }

  // 4. Mapping vers le schéma de la table products
  const products = filtered.map((row) => mapRow(row, runTimestamp));

  // 5. Upsert par lots (évite les payloads trop gros)
  const batches = chunk(products, BATCH_SIZE);
  let upserted = 0;
  for (const [index, batch] of batches.entries()) {
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'partnerize_id' });

    if (error) {
      throw new Error(`Échec de l'upsert du lot ${index + 1}/${batches.length} : ${error.message}`);
    }
    upserted += batch.length;
    console.log(`Lot ${index + 1}/${batches.length} upserté (${batch.length} produits)`);
  }
  console.log(`${upserted} produits upsertés au total`);

  // 6. Désactivation des produits absents de ce run (jamais vus dans ce fetch)
  //    -> couvre le cas "le produit a disparu du feed", en plus du mapping
  //    direct IN_STOCK / OUT_OF_STOCK déjà fait à l'étape 4.
  const { data: deactivated, error: deactivateError } = await supabase
    .from('products')
    .update({ is_active: false })
    .lt('last_seen_at', runTimestamp)
    .eq('is_active', true)
    .select('id');

  if (deactivateError) {
    throw new Error(`Échec de la désactivation des produits obsolètes : ${deactivateError.message}`);
  }
  console.log(`${deactivated?.length ?? 0} produits désactivés (absents du feed ou rupture de stock)`);

  console.log('Synchronisation terminée avec succès.');
}

main().catch((err) => {
  console.error('Erreur durant la synchronisation :', err);
  process.exit(1);
});
