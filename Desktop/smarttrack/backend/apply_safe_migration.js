const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function applySafeMigration() {
  console.log('🚀 Starting Safe Schema Optimization (Fix 1)...');
  console.log('');

  try {
    console.log('1️⃣  Creating stock_movements table...');
    await db.query(`
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
      )
    `);
    console.log('   ✅ stock_movements table created or already exists');

    console.log('');
    console.log('2️⃣  Adding user_id to customer_orders...');
    try {
      await db.query('ALTER TABLE customer_orders ADD COLUMN user_id INT AFTER customer_id');
      console.log('   ✅ user_id column added to customer_orders');
    } catch (e) {
      console.log(`   ⚠️  user_id column already exists or error: ${e.message}`);
    }
    try {
      await db.query('ALTER TABLE customer_orders ADD CONSTRAINT fk_customer_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL');
      console.log('   ✅ FK constraint added');
    } catch (e) {
      console.log(`   ⚠️  FK constraint already exists or error: ${e.message}`);
    }

    console.log('');
    console.log('3️⃣  Adding user_id to stock_adjustments...');
    try {
      await db.query('ALTER TABLE stock_adjustments ADD COLUMN user_id INT');
      console.log('   ✅ user_id column added to stock_adjustments');
    } catch (e) {
      console.log(`   ⚠️  user_id column already exists or error: ${e.message}`);
    }
    try {
      await db.query('ALTER TABLE stock_adjustments ADD CONSTRAINT fk_stock_adjustments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL');
      console.log('   ✅ FK constraint added');
    } catch (e) {
      console.log(`   ⚠️  FK constraint already exists or error: ${e.message}`);
    }

    console.log('');
    console.log('4️⃣  Creating v_sales_history view...');
    await db.query(`
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
      JOIN products p ON coi.product_id = p.id
    `);
    console.log('   ✅ v_sales_history view created');

    console.log('');
    console.log('✅✅✅ SAFE MIGRATION COMPLETED SUCCESSFULLY! ✅✅✅');
    console.log('');
    console.log('📋 What we did (NO DATA DELETED):');
    console.log('   - Created stock_movements table (new inventory audit trail)');
    console.log('   - Added user_id column to customer_orders');
    console.log('   - Added user_id column to stock_adjustments');
    console.log('   - Created v_sales_history VIEW (derived, no duplication)');
    console.log('');
    console.log('🔒 All your existing data and tables remain intact!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

applySafeMigration();
