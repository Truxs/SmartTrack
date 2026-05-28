USE grocery_inventory;

-- Update suppliers table to match user schema (contact_name instead of contact_person, remove address)
ALTER TABLE suppliers 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS updated_at,
CHANGE COLUMN contact_person contact_name VARCHAR(255);

-- Update purchase_orders table to match user schema (total instead of total_amount)
ALTER TABLE purchase_orders
CHANGE COLUMN total_amount total DECIMAL(10,2);

-- Update purchase_order_items to match user schema (po_id instead of purchase_order_id)
ALTER TABLE purchase_order_items
CHANGE COLUMN purchase_order_id po_id INT NOT NULL;

-- Update stock_adjustments reason ENUM to match user schema
ALTER TABLE stock_adjustments
MODIFY COLUMN reason ENUM('received','damaged','expired','theft','correction') NOT NULL;

-- Optional: Update products table to match user schema if needed
-- If products table doesn't have unit_cost, sale_price, current_qty, let's check
-- But our existing products table has barcode, name, category, price, reorder_level, supplier_id, total_stock (from join)
-- We can add these columns if needed
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0.00 AFTER category,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2) DEFAULT 0.00 AFTER unit_cost,
ADD COLUMN IF NOT EXISTS current_qty INT DEFAULT 0 AFTER sale_price,
ADD COLUMN IF NOT EXISTS expiry_date DATE AFTER reorder_level;
