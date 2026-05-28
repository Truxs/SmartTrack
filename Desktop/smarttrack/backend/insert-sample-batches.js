
const db = require('./config/db');

async function insertBatches() {
  try {
    console.log("Inserting sample stock batches...");
    const [products] = await db.query('SELECT id, name, current_qty FROM products WHERE is_active = TRUE');

    for (const product of products) {
      const qty = product.current_qty || 10;
      await db.query(
        `INSERT INTO stock_batches (
          product_id, quantity, expiry_date, date_received, is_depleted
        ) VALUES (?, ?, ?, NOW(), FALSE)`,
        [
          product.id,
          qty,
          "2030-01-01"
        ]
      );
    }

    console.log("✅ All sample stock batches inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting batches:", err);
    process.exit(1);
  }
}

insertBatches();
