-- EMERGENCY permission fix
-- Disable Row Level Security (RLS) completely to rule out permission issues
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Grant ALL permissions to public/anon just in case
GRANT ALL ON site_settings TO anon;
GRANT ALL ON site_settings TO authenticated;
GRANT ALL ON site_settings TO service_role;

-- Ensure the ID 'main' exists
INSERT INTO site_settings (id, bg_theme)
VALUES ('main', 'gradient')
ON CONFLICT (id) DO NOTHING;
