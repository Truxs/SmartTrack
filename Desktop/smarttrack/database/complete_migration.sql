USE grocery_inventory;

-- Ensure products has all required fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS description TEXT AFTER name,
ADD COLUMN IF NOT EXISTS category_id INT AFTER description,
ADD COLUMN IF NOT EXISTS reorder_point INT DEFAULT 0 AFTER current_qty,
ADD COLUMN IF NOT EXISTS expiry_date DATE AFTER reorder_point,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) AFTER expiry_date;

-- Create categories table if needed (for category_id)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT IGNORE INTO categories (name, description, display_order) VALUES 
('Produce', 'Fresh fruits and vegetables', 1), 
('Dairy', 'Milk, cheese, and other dairy products', 2), 
('Beverages', 'Drinks, juices, and sodas', 3), 
('Snacks', 'Chips, cookies, and snacks', 4), 
('Meat', 'Fresh meat and poultry', 5), 
('Seafood', 'Fish and seafood', 6), 
('Bakery', 'Bread and pastries', 7);

-- Rename reorder_level to reorder_point if it exists
ALTER TABLE products 
CHANGE COLUMN IF EXISTS reorder_level reorder_point INT DEFAULT 0;

-- Rename price to sale_price if needed
ALTER TABLE products 
CHANGE COLUMN IF EXISTS price sale_price DECIMAL(10,2) DEFAULT 0.00;

-- Ensure purchase_orders has correct status enum
ALTER TABLE purchase_orders
MODIFY COLUMN status ENUM('draft', 'sent', 'received') DEFAULT 'draft';

-- Rename purchase_order_items to po_line_items
RENAME TABLE IF EXISTS purchase_order_items TO po_line_items;

-- Rename columns in po_line_items
ALTER TABLE po_line_items
CHANGE COLUMN IF EXISTS quantity_ordered qty_ordered INT NOT NULL DEFAULT 0,
CHANGE COLUMN IF EXISTS quantity_received qty_received INT DEFAULT 0;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_cart_product (cart_id, product_id)
);

-- Update customer_orders table to include more fields
ALTER TABLE customer_orders 
ADD COLUMN IF NOT EXISTS customer_id INT AFTER id,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) AFTER customer_phone,
ADD COLUMN IF NOT EXISTS customer_address TEXT AFTER customer_email,
ADD COLUMN IF NOT EXISTS payment_method ENUM('cash','card','digital') DEFAULT 'cash' AFTER status,
ADD COLUMN IF NOT EXISTS amount_received DECIMAL(10,2) AFTER payment_method,
ADD COLUMN IF NOT EXISTS change_due DECIMAL(10,2) AFTER amount_received,
ADD FOREIGN KEY IF NOT EXISTS (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Add subtotal to customer_order_items
ALTER TABLE customer_order_items
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL AFTER unit_price;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_method ENUM('cash','card','digital') DEFAULT 'cash',
    amount_received DECIMAL(10,2),
    change_due DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES customer_orders(id)
);

-- Create sales_history table if not exists (for dashboard)
CREATE TABLE IF NOT EXISTS sales_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    quantity_sold INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
