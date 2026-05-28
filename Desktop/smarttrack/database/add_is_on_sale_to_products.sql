USE grocery_inventory;

-- Add is_on_sale column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT FALSE AFTER image_url;
