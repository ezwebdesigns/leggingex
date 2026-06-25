$public = "$PSScriptRoot\public"

function q($s) {
    if ([string]::IsNullOrWhiteSpace($s)) { return 'NULL' }
    return "'$($s -replace "'","''")'"
}

function b($v) {
    if ($v -eq 'true') { return 'true' }
    return 'false'
}

$sql = @"

-- ============================================
-- Import Base44 to Supabase
-- ============================================

"@

# hero_banners
$lines = @()
Import-Csv "$public\HeroBanner_export.csv" | ForEach-Object {
    $lines += "($(q $_.title), $(q $_.subtitle), $(q $_.image_url), $(q $_.link), $($_.sort_order), $(b $_.is_active))"
}
$sql += "INSERT INTO hero_banners (title, subtitle, image_url, link, sort_order, is_active) VALUES`n"
$sql += ($lines -join ",`n") + ";`n`n"

# home_sections
$lines = @()
Import-Csv "$public\HomeSection_export.csv" | ForEach-Object {
    $type = if ([string]::IsNullOrWhiteSpace($_.section_type)) { "'products'" } else { "'$($_.section_type)'" }
    $cat = if ([string]::IsNullOrWhiteSpace($_.category)) { 'NULL' } else { "'$($_.category)'" }
    $lim = if ([string]::IsNullOrWhiteSpace($_.limit)) { 'NULL' } else { $_.limit }
    $lines += "($(q $_.title), $type, $cat, $($_.sort_order), $lim, $(b $_.is_active))"
}
$sql += "INSERT INTO home_sections (title, section_type, category, sort_order, product_limit, is_active) VALUES`n"
$sql += ($lines -join ",`n") + ";`n`n"

# category_tags
$lines = @()
Import-Csv "$public\CategoryTag_export.csv" | ForEach-Object {
    $lines += "($(q $_.label), $(q $_.value), $($_.sort_order), $(b $_.is_active))"
}
$sql += "INSERT INTO category_tags (label, value, sort_order, is_active) VALUES`n"
$sql += ($lines -join ",`n") + ";`n`n"

# home_categories
$lines = @()
Import-Csv "$public\HomeCategory_export.csv" | ForEach-Object {
    $img = if ([string]::IsNullOrWhiteSpace($_.image_url)) { 'NULL' } else { "'$($_.image_url)'" }
    $lines += "($(q $_.label), $(q $_.value), $img, $($_.sort_order), $(b $_.is_active))"
}
$sql += "INSERT INTO home_categories (label, value, image_url, sort_order, is_active) VALUES`n"
$sql += ($lines -join ",`n") + ";`n`n"

# cta_cards
$lines = @()
Import-Csv "$public\CTACard_export.csv" | ForEach-Object {
    $bg = if ([string]::IsNullOrWhiteSpace($_.bg_color)) { 'NULL' } else { "'$($_.bg_color)'" }
    $tc = if ([string]::IsNullOrWhiteSpace($_.text_color)) { 'NULL' } else { "'$($_.text_color)'" }
    $lines += "($(q $_.title), $(q $_.image_url), $(q $_.link), $bg, $tc, $($_.sort_order), $(b $_.is_active))"
}
$sql += "INSERT INTO cta_cards (title, image_url, link, bg_color, text_color, sort_order, is_active) VALUES`n"
$sql += ($lines -join ",`n") + ";`n`n"

$sql += "-- editorial_cards: no data`n`n"

# ad_banners (dollar-quoting for script_content)
$lines = @()
Import-Csv "$public\AdBanner_export.csv" | ForEach-Object {
    $bt = if ([string]::IsNullOrWhiteSpace($_.button_text)) { 'NULL' } else { "'$($_.button_text)'" }
    $bg = if ([string]::IsNullOrWhiteSpace($_.bg_color)) { 'NULL' } else { "'$($_.bg_color)'" }
    $sc = if ([string]::IsNullOrWhiteSpace($_.script_content)) { 'NULL' } else { "`$`$`n$($_.script_content)`n`$`$" }
    $lines += "($(q $_.type), $(q $_.title), $(q $_.subtitle), $(q $_.image_url), $(q $_.link), $bt, $bg, $sc, $($_.sort_order), $(b $_.is_active))"
}
$sql += "INSERT INTO ad_banners (type, title, subtitle, image_url, link, button_text, bg_color, script_content, sort_order, is_active) VALUES`n"
$sql += ($lines -join ",`n") + ";`n`n"

# pages
$lines = @()
Import-Csv "$public\Page_export.csv" | ForEach-Object {
    $pd = if ([string]::IsNullOrWhiteSpace($_.published_at)) { 'NULL' } else { "'$($_.published_at.Substring(0,10))'::DATE" }
    $img = if ([string]::IsNullOrWhiteSpace($_.cover_image)) { 'NULL' } else { "'$($_.cover_image)'" }
    $ex = if ([string]::IsNullOrWhiteSpace($_.excerpt)) { 'NULL' } else { "'$($_.excerpt)'" }
    $lines += "($(q $_.slug), $(q $_.title), $(q $_.content), $(q $_.type), $ex, $img, $(b $_.published), $pd)"
}
$sql += "INSERT INTO pages (slug, title, content, type, excerpt, cover_image, published, published_at) VALUES`n"
$sql += ($lines -join ",`n") + ";`n`n"

# b44_products
$lines = @()
Import-Csv "$public\Product_export.csv" | ForEach-Object {
    $p  = if ([string]::IsNullOrWhiteSpace($_.price))         { 'NULL' } else { $_.price }
    $r  = if ([string]::IsNullOrWhiteSpace($_.rating))        { 'NULL' } else { $_.rating }
    $rc = if ([string]::IsNullOrWhiteSpace($_.reviews_count)) { 'NULL' } else { $_.reviews_count }
    $bs = if ([string]::IsNullOrWhiteSpace($_.best_seller_rank)) { 'NULL' } else { $_.best_seller_rank }
    $lines += "($(q $_.name), $(q $_.brand), $(q $_.category), $(q $_.image_url), $p, $r, $rc, $bs, $(q $_.affiliate_url), $(q $_.affiliate_site), $(q $_.description), $(q $_.material), $(q $_.status), $(b $_.is_featured))"
}
$sql += "INSERT INTO b44_products (name, brand, category, image_url, price, rating, reviews_count, best_seller_rank, affiliate_url, affiliate_site, description, material, status, is_featured) VALUES`n"
$sql += ($lines -join ",`n") + ";"

$sql | Out-File -FilePath "$PSScriptRoot\import_data.sql" -Encoding utf8
Write-Output "SQL generated: import_data.sql"
