const db = require('./config/db');

async function verifyMigration() {
  console.log('🔍 Verifying Migration...');
  console.log('');

  try {
    // 1. Check stock_movements table exists
    const [smTables] = await db.query("SHOW TABLES LIKE 'stock_movements'");
    console.log(`1️⃣  stock_movements table: ${smTables.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);

    // 2. Check user_id in customer_orders
    const [coCols] = await db.query("SHOW COLUMNS FROM customer_orders LIKE 'user_id'");
    console.log(`2️⃣  customer_orders.user_id: ${coCols.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);

    // 3. Check user_id in stock_adjustments
    const [saCols] = await db.query("SHOW COLUMNS FROM stock_adjustments LIKE 'user_id'");
    console.log(`3️⃣  stock_adjustments.user_id: ${saCols.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);

    // 4. Check v_sales_history view
    const [views] = await db.query("SHOW FULL TABLES WHERE Table_Type = 'VIEW' AND Tables_in_grocery_inventory = 'v_sales_history'");
    console.log(`4️⃣  v_sales_history view: ${views.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);

    // 5. Check subtotal in customer_order_items
    const [coiCols] = await db.query("SHOW COLUMNS FROM customer_order_items LIKE 'subtotal'");
    console.log(`5️⃣  customer_order_items.subtotal: ${coiCols.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);

    console.log('');
    console.log('🎉 VERIFICATION COMPLETED!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verifyMigration();
