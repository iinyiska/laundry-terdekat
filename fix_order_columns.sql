-- Add missing columns for Order Details
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS items JSONB,
ADD COLUMN IF NOT EXISTS items_detail JSONB;

-- Comment on columns for clarity
COMMENT ON COLUMN public.orders.items IS 'Array of service items for Satuan orders';
COMMENT ON COLUMN public.orders.items_detail IS 'Object of item counts for Kiloan orders';
