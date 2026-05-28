
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const SQL_FILES = [
  '../database/add_suppliers_purchase_orders.sql',
  '../database/complete_migration.sql',
  '../database/add_stock_adjustments.sql',
  '../database/add_notes_to_suppliers.sql',
  '../database/add_image_url_to_products.sql'
];

async function applyMigration(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const sql = fs.readFileSync(fullPath, 'utf8');
  console.log(`Applying ${path.basename(filePath)}...`);
  try {
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (let statement of statements) {
      if (statement.toUpperCase().startsWith('USE')) continue;
      await db.query(statement);
    }
    console.log(`✅ Applied ${path.basename(filePath)}`);
  } catch(e) {
    console.warn(`⚠️  Issue applying ${path.basename(filePath)}: ${e.message}`);
  }
}

async function main() {
  console.log('Starting migration process...');
  for (let file of SQL_FILES) {
    await applyMigration(file);
  }

  console.log('\nChecking suppliers table columns (to add address/notes):');
  const [cols] = await db.query("SHOW COLUMNS FROM suppliers LIKE 'address'");
  if(cols.length === 0) {
    try {
      await db.query('ALTER TABLE suppliers ADD COLUMN address TEXT');
      await db.query('ALTER TABLE suppliers ADD COLUMN notes TEXT');
      console.log('✅ Added address and notes to suppliers');
    } catch(e) {
      console.warn('⚠️  Could not add address/notes:', e.message);
    }
  }

  console.log('\n✅ All migrations complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
