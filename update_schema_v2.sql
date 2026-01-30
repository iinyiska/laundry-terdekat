-- Run this in Supabase Dashboard > SQL Editor
-- This adds the columns needed for App Title and Logo customization

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS app_title text DEFAULT 'Laundry Terdekat';

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS app_logo text DEFAULT '';
