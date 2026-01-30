-- Add potentially missing columns to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_bg_url text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS bg_theme text DEFAULT 'gradient';

-- Ensure other columns exist
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS promo_enabled boolean DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS express_enabled boolean DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_title text DEFAULT 'Cuci Bersih, Wangi Sempurna';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_subtitle text DEFAULT 'Platform laundry paling canggih...';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS promo_text text DEFAULT 'Diskon 20%';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#3b82f6';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#8b5cf6';

-- Permissions (Just in case)
GRANT ALL ON site_settings TO anon;
GRANT ALL ON site_settings TO service_role;
