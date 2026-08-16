/*
# LUMÉ Seed Data

Populates categories and products with realistic skincare catalog data.
Uses real Pexels stock photography for all product images.

## Categories (6)
1. Cleansers — slug: cleansers
2. Serums — slug: serums
3. Moisturizers — slug: moisturizers
4. Sun Protection — slug: sun-protection
5. Masks & Treatments — slug: masks-treatments
6. Lip & Eye Care — slug: lip-eye-care

## Products (24)
4 products per category, each with 2-3 images, sizes, skin type, ratings, and stock.
*/

-- Clear existing seed data (safe re-run)
DELETE FROM products WHERE slug LIKE 'lume-%';
DELETE FROM categories WHERE slug IN ('cleansers','serums','moisturizers','sun-protection','masks-treatments','lip-eye-care');

-- ============ CATEGORIES ============
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Cleansers', 'cleansers', 'Gentle yet effective formulas to remove impurities while respecting your skin barrier.', 1),
('Serums', 'serums', 'Concentrated actives that target specific concerns — from brightness to firmness.', 2),
('Moisturizers', 'moisturizers', 'Lock in hydration with lightweight gels and rich creams for every skin type.', 3),
('Sun Protection', 'sun-protection', 'Daily SPF that protects without the white cast. Non-negotiable for healthy skin.', 4),
('Masks & Treatments', 'masks-treatments', 'Weekly rituals for an instant boost — clay, sheet, and overnight treatments.', 5),
('Lip & Eye Care', 'lip-eye-care', 'Targeted care for delicate areas. Smooth, brighten, and protect.', 6);

-- ============ PRODUCTS ============
-- Helper: get category IDs via subqueries

-- CLEANSERS
INSERT INTO products (slug, name, description, price, compare_at_price, category_id, images, sizes, skin_type, stock, rating, review_count, featured) VALUES
('gentle-gel-cleanser', 'Gentle Gel Cleanser', 'A pH-balanced gel cleanser that lifts away makeup, SPF, and excess oil without stripping the skin barrier. Formulated with glycerin and green tea extract for a clean, comfortable finish.', 28.00, NULL, (SELECT id FROM categories WHERE slug='cleansers'),
'["https://images.pexels.com/photos/14836428/pexels-photo-14836428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/15168957/pexels-photo-15168957.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/8015835/pexels-photo-8015835.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["150ml","250ml"]'::jsonb, 'all', 120, 4.7, 89, true),

('clarifying-foam-wash', 'Clarifying Foam Wash', 'A deep-cleansing foam that targets congestion and excess sebum. Salicylic acid and niacinamide work together to refine pores and balance oil production.', 32.00, NULL, (SELECT id FROM categories WHERE slug='cleansers'),
'["https://images.pexels.com/photos/16008943/pexels-photo-16008943.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/30877766/pexels-photo-30877766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["150ml"]'::jsonb, 'oily', 85, 4.5, 64, false),

('cream-to-milk-cleanser', 'Cream-to-Milk Cleanser', 'A nourishing cleanser that transforms from a rich cream to a silky milk upon contact with water. Perfect for dry and sensitive skin — removes impurities while leaving skin soft and supple.', 30.00, NULL, (SELECT id FROM categories WHERE slug='cleansers'),
'["https://images.pexels.com/photos/15569182/pexels-photo-15569182.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/16378446/pexels-photo-16378446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["150ml","250ml"]'::jsonb, 'dry', 95, 4.8, 72, true),

('daily-micellar-water', 'Daily Micellar Water', 'A no-rinse cleanser powered by micellar technology. Gently captures makeup, dirt, and oil in a single sweep. Infused with rose water and chamomile for a soothing finish.', 22.00, 28.00, (SELECT id FROM categories WHERE slug='cleansers'),
'["https://images.pexels.com/photos/15893283/pexels-photo-15893283.png?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/8015835/pexels-photo-8015835.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["200ml","400ml"]'::jsonb, 'all', 200, 4.4, 51, false);

-- SERUMS
INSERT INTO products (slug, name, description, price, compare_at_price, category_id, images, sizes, skin_type, stock, rating, review_count, featured) VALUES
('vitamin-c-brightening-serum', 'Vitamin C Brightening Serum', 'A 15% L-ascorbic acid serum that visibly brightens, evens skin tone, and protects against environmental stress. Lightweight, fast-absorbing, and layers seamlessly under moisturizer.', 58.00, NULL, (SELECT id FROM categories WHERE slug='serums'),
'["https://images.pexels.com/photos/8101534/pexels-photo-8101534.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/8101529/pexels-photo-8101529.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7885948/pexels-photo-7885948.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["30ml"]'::jsonb, 'all', 150, 4.8, 203, true),

('hyaluronic-hydration-serum', 'Hyaluronic Hydration Serum', 'A multi-weight hyaluronic acid serum that draws moisture into every layer of the skin. Plumps fine lines and delivers a dewy, glass-skin finish.', 48.00, NULL, (SELECT id FROM categories WHERE slug='serums'),
'["https://images.pexels.com/photos/8101511/pexels-photo-8101511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/8100777/pexels-photo-8100777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["30ml","50ml"]'::jsonb, 'all', 175, 4.7, 156, true),

('retinol-renewal-serum', 'Retinol Renewal Serum', 'A 0.3% encapsulated retinol serum that smooths texture, refines pores, and reduces the appearance of fine lines. Time-release technology minimizes irritation for gradual, visible results.', 65.00, NULL, (SELECT id FROM categories WHERE slug='serums'),
'["https://images.pexels.com/photos/12146904/pexels-photo-12146904.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/27357170/pexels-photo-27357170.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["30ml"]'::jsonb, 'all', 90, 4.6, 98, false),

('niacinamide-pore-refining-serum', 'Niacinamide Pore Refining Serum', 'A 10% niacinamide serum that visibly minimizes pore size, regulates oil, and strengthens the skin barrier. Paired with zinc PCA for balanced, clear skin.', 42.00, 52.00, (SELECT id FROM categories WHERE slug='serums'),
'["https://images.pexels.com/photos/7797735/pexels-photo-7797735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/8101673/pexels-photo-8101673.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["30ml"]'::jsonb, 'oily', 110, 4.5, 87, false);

-- MOISTURIZERS
INSERT INTO products (slug, name, description, price, compare_at_price, category_id, images, sizes, skin_type, stock, rating, review_count, featured) VALUES
('daily-hydration-gel-cream', 'Daily Hydration Gel Cream', 'A weightless gel-cream moisturizer with squalane and panthenol. Absorbs in seconds, delivers 48-hour hydration, and leaves a natural, dewy finish — never greasy.', 44.00, NULL, (SELECT id FROM categories WHERE slug='moisturizers'),
'["https://images.pexels.com/photos/36698525/pexels-photo-36698525.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/6690232/pexels-photo-6690232.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'all', 140, 4.7, 134, true),

('rich-barrier-cream', 'Rich Barrier Cream', 'A deeply nourishing cream with ceramides, shea butter, and peptides. Restores the moisture barrier overnight and leaves dry skin plump, smooth, and comfortable by morning.', 52.00, NULL, (SELECT id FROM categories WHERE slug='moisturizers'),
'["https://images.pexels.com/photos/18350885/pexels-photo-18350885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/34544440/pexels-photo-34544440.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'dry', 100, 4.8, 91, true),

('oil-free-mattifying-moisturizer', 'Oil-Free Mattifying Moisturizer', 'A shine-control moisturizer with silica and green tea extract. Hydrates without adding oil, leaving a matte, velvety finish that lasts all day.', 38.00, NULL, (SELECT id FROM categories WHERE slug='moisturizers'),
'["https://images.pexels.com/photos/7691162/pexels-photo-7691162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7691159/pexels-photo-7691159.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'oily', 85, 4.4, 67, false),

('overnight-recovery-cream', 'Overnight Recovery Cream', 'A restorative night cream with peptides, bakuchiol, and evening primrose oil. Works while you sleep to firm, smooth, and revive tired skin.', 62.00, NULL, (SELECT id FROM categories WHERE slug='moisturizers'),
'["https://images.pexels.com/photos/28481891/pexels-photo-28481891.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/21283464/pexels-photo-21283464.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'all', 75, 4.6, 54, false);

-- SUN PROTECTION
INSERT INTO products (slug, name, description, price, compare_at_price, category_id, images, sizes, skin_type, stock, rating, review_count, featured) VALUES
('invisible-daily-spf-50', 'Invisible Daily SPF 50', 'A weightless, invisible sunscreen that disappears into all skin tones. Broad-spectrum SPF 50 with antioxidants — no white cast, no greasy residue, no pilling under makeup.', 38.00, NULL, (SELECT id FROM categories WHERE slug='sun-protection'),
'["https://images.pexels.com/photos/8384509/pexels-photo-8384509.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/34823989/pexels-photo-34823989.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'all', 200, 4.8, 187, true),

('mineral-spf-30-sheer', 'Mineral SPF 30 Sheer', 'A 100% mineral sunscreen with zinc oxide and niacinamide. Sheer tint blends seamlessly for a natural, even finish. Ideal for sensitive and reactive skin.', 42.00, NULL, (SELECT id FROM categories WHERE slug='sun-protection'),
'["https://images.pexels.com/photos/13779259/pexels-photo-13779259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/13779260/pexels-photo-13779260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'sensitive', 120, 4.6, 78, false),

('tinted-glow-spf-40', 'Tinted Glow SPF 40', 'A lightly tinted sunscreen that doubles as a primer. Gives skin a healthy, dewy glow while protecting against UVA/UVB and blue light. Wear it alone or under foundation.', 40.00, 48.00, (SELECT id FROM categories WHERE slug='sun-protection'),
'["https://images.pexels.com/photos/11935638/pexels-photo-11935638.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/32110926/pexels-photo-32110926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'all', 95, 4.5, 62, false),

('sport-resistant-spf-50', 'Sport Resistant SPF 50', 'A water-resistant, sweat-proof formula for active days. Lightweight, non-sticky, and reef-safe. Reapply every two hours for full protection outdoors.', 36.00, NULL, (SELECT id FROM categories WHERE slug='sun-protection'),
'["https://images.pexels.com/photos/19466165/pexels-photo-19466165.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/16378485/pexels-photo-16378485.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["100ml"]'::jsonb, 'all', 80, 4.4, 43, false);

-- MASKS & TREATMENTS
INSERT INTO products (slug, name, description, price, compare_at_price, category_id, images, sizes, skin_type, stock, rating, review_count, featured) VALUES
('detox-clay-mask', 'Detox Clay Mask', 'A kaolin and bentonite clay mask that draws out impurities and absorbs excess oil without drying the skin. Added glycerin and aloe keep skin comfortable. Use 1-2 times weekly.', 36.00, NULL, (SELECT id FROM categories WHERE slug='masks-treatments'),
'["https://images.pexels.com/photos/6925512/pexels-photo-6925512.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/8076094/pexels-photo-8076094.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["100ml"]'::jsonb, 'all', 90, 4.6, 76, true),

('overnight-glow-mask', 'Overnight Glow Mask', 'A leave-on overnight treatment with glycolic acid, glycerin, and rosehip oil. Exfoliates gently while you sleep — wake up to smoother, brighter, more radiant skin.', 48.00, NULL, (SELECT id FROM categories WHERE slug='masks-treatments'),
'["https://images.pexels.com/photos/8260622/pexels-photo-8260622.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/8406601/pexels-photo-8406601.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["50ml"]'::jsonb, 'all', 70, 4.7, 58, false),

('bio-cellulose-sheet-mask', 'Bio-Cellulose Sheet Mask', 'A single-use bio-cellulose mask drenched in hyaluronic acid, peptides, and centella asiatica. Delivers an instant boost of hydration and calm in 20 minutes.', 12.00, NULL, (SELECT id FROM categories WHERE slug='masks-treatments'),
'["https://images.pexels.com/photos/11179550/pexels-photo-11179550.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/6619517/pexels-photo-6619517.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["single"]'::jsonb, 'all', 300, 4.5, 112, false),

('aha-bha-resurfacing-treatment', 'AHA-BHA Resurfacing Treatment', 'A liquid exfoliant with glycolic, lactic, and salicylic acids. Unclogs pores, smooths texture, and brightens tone. Use 2-3 times weekly for visibly renewed skin.', 54.00, 64.00, (SELECT id FROM categories WHERE slug='masks-treatments'),
'["https://images.pexels.com/photos/4760309/pexels-photo-4760309.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7479654/pexels-photo-7479654.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["100ml"]'::jsonb, 'all', 60, 4.6, 49, false);

-- LIP & EYE CARE
INSERT INTO products (slug, name, description, price, compare_at_price, category_id, images, sizes, skin_type, stock, rating, review_count, featured) VALUES
('brightening-eye-cream', 'Brightening Eye Cream', 'A peptide and caffeine eye cream that de-puffs, brightens dark circles, and smooths fine lines. Lightweight yet nourishing — layers beautifully under concealer.', 46.00, NULL, (SELECT id FROM categories WHERE slug='lip-eye-care'),
'["https://images.pexels.com/photos/12053218/pexels-photo-12053218.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/16329592/pexels-photo-16329592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["15ml"]'::jsonb, 'all', 110, 4.7, 84, true),

('firming-eye-serum', 'Firming Eye Serum', 'A targeted eye serum with retinol, peptides, and vitamin K. Visibly firms the eye area and reduces the appearance of crow''s feet over time. Gentle enough for nightly use.', 58.00, NULL, (SELECT id FROM categories WHERE slug='lip-eye-care'),
'["https://images.pexels.com/photos/29611528/pexels-photo-29611528.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/18992757/pexels-photo-18992757.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["15ml"]'::jsonb, 'all', 65, 4.5, 41, false),

('nourishing-lip-treatment', 'Nourishing Lip Treatment', 'A rich lip balm with shea butter, squalane, and vitamin E. Repairs dry, chapped lips overnight and leaves a subtle, non-sticky sheen. Wear day or night.', 18.00, NULL, (SELECT id FROM categories WHERE slug='lip-eye-care'),
'["https://images.pexels.com/photos/26927323/pexels-photo-26927323.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/26927320/pexels-photo-26927320.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["4g"]'::jsonb, 'all', 250, 4.6, 96, true),

('lip-renewal-scrub', 'Lip Renewal Scrub', 'A gentle sugar scrub that buffs away dry skin and preps lips for color or balm. Infused with jojoba oil and honey for a soft, smooth finish.', 16.00, 20.00, (SELECT id FROM categories WHERE slug='lip-eye-care'),
'["https://images.pexels.com/photos/37661673/pexels-photo-37661673.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/20382237/pexels-photo-20382237.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
'["10g"]'::jsonb, 'all', 180, 4.4, 38, false);
