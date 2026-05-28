
const db = require('./config/db');

async function addColumn() {
  try {
    console.log('Adding is_on_sale column to products table...');
    await db.query(`
      ALTER TABLE products 
      ADD COLUMN is_on_sale BOOLEAN DEFAULT FALSE AFTER is_active
    `);

    console.log('Setting some products to be on sale...');
    await db.query(`
      UPDATE products 
      SET is_on_sale = TRUE 
      WHERE id IN (SELECT id FROM (SELECT id FROM products LIMIT 5) AS temp)
    `);

    console.log('✅ Done!');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ is_on_sale column already exists');
      console.log('Setting some products to be on sale...');
      await db.query(`
        UPDATE products 
        SET is_on_sale = TRUE 
        WHERE id IN (SELECT id FROM (SELECT id FROM products LIMIT 5) AS temp)
      `);
      console.log('✅ Done!');
      process.exit(0);
    }
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addColumn();
