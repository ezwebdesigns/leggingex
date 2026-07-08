import LeggingShortcode from '@/components/LeggingShortcode';

// Syntaxe supportée :
//   [biker shorts, 10, rating]
//   [flare leggings, 10, best]
//   [gym shorts, 7, price]
//   [yoga pants, 8, Gayhay]          ← tri = nom de marque
//   [plus size leggings, 5, rating, CA]  ← avec filtre marketplace
//
// Param 1 : catégorie (correspondance exacte avec les labels CATEGORY_RULES)
// Param 2 : nombre de produits (1–20)
// Param 3 : tri (rating | best | price) OU nom de marque
// Param 4 : marketplace optionnel (CA | US)

// Le shortcode peut être nu dans le HTML ou enveloppé dans un <p> par TipTap
// (ex: <p>[biker shorts, 10, rating]</p>). Le regex gère les deux cas.
const SHORTCODE_REGEX = /(?:<p[^>]*>)?\[([a-zA-ZÀ-ÿ\s]+),\s*(\d+),\s*([a-zA-Z0-9\s]+?)(?:,\s*(CA|US))?\](?:<\/p>)?/g;

export function renderContent(html) {
  if (!html) return null;

  const parts = [];
  let lastIndex = 0;
  let match;

  SHORTCODE_REGEX.lastIndex = 0;

  while ((match = SHORTCODE_REGEX.exec(html)) !== null) {
    const [full, rawCategory, rawLimit, rawSort, marketplace] = match;

    // HTML avant le shortcode
    if (match.index > lastIndex) {
      parts.push(
        <div
          key={`html-${lastIndex}`}
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html.slice(lastIndex, match.index) }}
        />
      );
    }

    const category = rawCategory.trim();
    const limit    = Math.min(parseInt(rawLimit.trim(), 10), 20);
    const sort     = rawSort.trim().toLowerCase();

    parts.push(
      <LeggingShortcode
        key={`sc-${match.index}`}
        category={category}
        sort={sort}
        limit={limit}
        marketplace={marketplace || null}
      />
    );

    lastIndex = match.index + full.length;
  }

  // HTML restant après le dernier shortcode
  if (lastIndex < html.length) {
    parts.push(
      <div
        key={`html-${lastIndex}`}
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html.slice(lastIndex) }}
      />
    );
  }

  // Aucun shortcode — rendu HTML normal
  if (parts.length === 0) {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <>{parts}</>;
}
