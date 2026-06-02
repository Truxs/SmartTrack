USE grocery_inventory;

-- =============================================
-- SAFE SCHEMA OPTIMIZATION MIGRATION
-- Backward Compatible - NO DELETIONS!
-- =============================================

-- 1. Add missing columns (without deleting existing ones) to customer_orders
-- Keep existing customer_name/customer_phone etc for backward compatibility
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'grocery_inventory' 
    AND TABLE_NAME = 'customer_orders' 
    AND COLUMN_NAME = 'user_id'
);
SET @add_col_sql = IF(@col_exists = 0, 
    'ALTER TABLE customer_orders ADD COLUMN user_id INT AFTER customer_id', 
    'SELECT ''Column already exists'' AS message'
);
PREPARE add_col_stmt FROM @add_col_sql;
EXECUTE add_col_stmt;
DEALLOCATE PREPARE add_col_stmt;

-- Add FK for user_id (if column exists)
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'grocery_inventory' 
    AND TABLE_NAME = 'customer_orders' 
    AND CONSTRAINT_NAME = 'fk_customer_orders_user'
);
SET @col_exists_again = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'grocery_inventory' 
    AND TABLE_NAME = 'customer_orders' 
    AND COLUMN_NAME = 'user_id'
);
SET @sql = IF(@fk_exists = 0 AND @col_exists_again = 1, 
    'ALTER TABLE customer_orders ADD CONSTRAINT fk_customer_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL', 
    'SELECT ''FK already exists or column missing'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Add stock_movements table (single source of truth for inventory changes)
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('purchase', 'sale', 'adjustment', 'return') NOT NULL,
    qty_change INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Add user_id to stock_adjustments for tracking who made changes
SET @sa_col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'grocery_inventory' 
    AND TABLE_NAME = 'stock_adjustments' 
    AND COLUMN_NAME = 'user_id'
);
SET @add_sa_col_sql = IF(@sa_col_exists = 0, 
    'ALTER TABLE stock_adjustments ADD COLUMN user_id INT', 
    'SELECT ''Column already exists'' AS message'
);
PREPARE add_sa_col_stmt FROM @add_sa_col_sql;
EXECUTE add_sa_col_stmt;
DEALLOCATE PREPARE add_sa_col_stmt;

SET @fk_sa_user_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'grocery_inventory' 
    AND TABLE_NAME = 'stock_adjustments' 
    AND CONSTRAINT_NAME = 'fk_stock_adjustments_user'
);
SET @sa_col_exists_again = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'grocery_inventory' 
    AND TABLE_NAME = 'stock_adjustments' 
    AND COLUMN_NAME = 'user_id'
);
SET @sql_sa = IF(@fk_sa_user_exists = 0 AND @sa_col_exists_again = 1, 
    'ALTER TABLE stock_adjustments ADD CONSTRAINT fk_stock_adjustments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL', 
    'SELECT ''FK already exists or column missing'' AS message'
);
PREPARE stmt_sa FROM @sql_sa;
EXECUTE stmt_sa;
DEALLOCATE PREPARE stmt_sa;

-- 4. Create sales_history VIEW (instead of separate table - still backward compatible!)
-- We'll keep the existing sales_history table for now, but add the view too
CREATE OR REPLACE VIEW v_sales_history AS
SELECT 
    coi.id,
    coi.product_id,
    p.name AS product_name,
    p.barcode,
    coi.qty AS quantity_sold,
    coi.subtotal AS total_price,
    coi.created_at AS timestamp
FROM customer_order_items coi
JOIN products p ON coi.product_id = p.id;

-- 5. Add subtotal column to customer_order_items if missing
ALTER TABLE customer_order_items 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER unit_price;
