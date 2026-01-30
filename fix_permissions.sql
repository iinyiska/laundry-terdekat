-- Enable RLS (if not already)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to READ site_settings (needed for the app to work)
CREATE POLICY "Allow anon read site_settings" ON site_settings
FOR SELECT USING (true);

-- Allow anonymous access to UPDATE site_settings (needed for admin panel without auth)
-- Note: In a real production app, you should use authenticated roles.
CREATE POLICY "Allow anon update site_settings" ON site_settings
FOR UPDATE USING (true);

-- Allow anonymous access to INSERT site_settings
CREATE POLICY "Allow anon insert site_settings" ON site_settings
FOR INSERT WITH CHECK (true);

-- Grant permissions to anon role
GRANT ALL ON site_settings TO anon;
GRANT ALL ON site_settings TO service_role;
