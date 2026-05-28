
const db = require('./config/db');

async function fixTables() {
  try {
    console.log('Creating suppliers table (if not exists) with correct columns...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ suppliers table created');

    console.log('Creating purchase_orders (if not exists)...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT NOT NULL,
        status ENUM('draft', 'sent', 'received') DEFAULT 'draft',
        total DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ purchase_orders table created');

    console.log('Creating po_line_items (if not exists)...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS po_line_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_id INT NOT NULL,
        product_id INT NOT NULL,
        qty_ordered INT NOT NULL DEFAULT 0,
        qty_received INT DEFAULT 0,
        unit_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ po_line_items table created');

    console.log('Inserting sample suppliers...');
    await db.query(`
      INSERT IGNORE INTO suppliers (name, contact_person, email, phone, address, notes) VALUES
      ('Fresh Produce Co.', 'John Smith', 'john@freshproduce.com', '555-1234', '123 Market St, City', 'Delivery on Tue/Fri'),
      ('Dairy Distributors', 'Jane Doe', 'jane@dairy.com', '555-5678', '456 Farm Rd, Town', 'Minimum order $100'),
      ('Beverage Wholesalers', 'Bob Johnson', 'bob@beverages.com', '555-9012', '789 Beverage Ave, Village', 'Returns within 7 days')
    `);
    console.log('✅ Sample suppliers inserted');

    console.log('Checking products table columns...');
    const [cols] = await db.query("SHOW COLUMNS FROM products");
    const existingCols = cols.map(c => c.Field);
    console.log('Existing products columns:', existingCols);

    // Ensure products has all necessary columns for backend routes
    if (!existingCols.includes('description')) {
      await db.query('ALTER TABLE products ADD COLUMN description TEXT');
      console.log('✅ Added description column');
    }
    if (!existingCols.includes('category_id')) {
      await db.query('ALTER TABLE products ADD COLUMN category_id INT');
      console.log('✅ Added category_id column');
    }
    if (!existingCols.includes('unit_cost')) {
      await db.query('ALTER TABLE products ADD COLUMN unit_cost DECIMAL(10,2) DEFAULT 0.00');
      console.log('✅ Added unit_cost column');
    }
    if (!existingCols.includes('sale_price')) {
      await db.query('ALTER TABLE products ADD COLUMN sale_price DECIMAL(10,2) DEFAULT 0.00');
      // copy price to sale_price
      await db.query('UPDATE products SET sale_price = price');
      console.log('✅ Added sale_price column (copied from price)');
    }
    if (!existingCols.includes('current_qty')) {
      await db.query('ALTER TABLE products ADD COLUMN current_qty INT DEFAULT 0');
      // copy total_stock if exists
      if (existingCols.includes('total_stock')) {
        await db.query('UPDATE products SET current_qty = total_stock');
      }
      console.log('✅ Added current_qty column');
    }
    if (!existingCols.includes('reorder_point')) {
      await db.query('ALTER TABLE products ADD COLUMN reorder_point INT DEFAULT 10');
      // copy reorder_level if exists
      if (existingCols.includes('reorder_level')) {
        await db.query('UPDATE products SET reorder_point = reorder_level');
      }
      console.log('✅ Added reorder_point column');
    }
    if (!existingCols.includes('expiry_date')) {
      await db.query('ALTER TABLE products ADD COLUMN expiry_date DATE');
      console.log('✅ Added expiry_date column');
    }
    if (!existingCols.includes('is_active')) {
      await db.query('ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
      console.log('✅ Added is_active column');
    }
    if (!existingCols.includes('supplier_id')) {
      await db.query('ALTER TABLE products ADD COLUMN supplier_id INT');
      console.log('✅ Added supplier_id column');
    }

    console.log('\n✅ All tables fixed!');
    process.exit(0);
  } catch(e) {
    console.error('❌ Error fixing tables:', e);
    process.exit(1);
  }
}

fixTables();
