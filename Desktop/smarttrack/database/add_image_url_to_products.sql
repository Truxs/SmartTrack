USE grocery_inventory;

-- Add image_url column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;
