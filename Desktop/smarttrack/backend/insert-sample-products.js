
const db = require('./config/db');

// Categories mapped to our category IDs/names
const sampleProducts = [
  {
    name: "Laundry Detergent",
    category: "complete-home",
    description: "Complete Home laundry detergent",
    unit_cost: 85.00,
    sale_price: 120.00,
    price: 120.00,
    current_qty: 50,
    total_stock: 50,
    reorder_point: 15,
    reorder_level: 15,
    barcode: "9501234567001",
    image_url: "https://images.unsplash.com/photo-1582735689369-4f801a1f898e?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Tomatoes",
    category: "fresh-produce",
    description: "Fresh red tomatoes per kg",
    unit_cost: 60.00,
    sale_price: 95.00,
    price: 95.00,
    current_qty: 20,
    total_stock: 20,
    reorder_point: 10,
    reorder_level: 10,
    barcode: "9501234567002",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Beef Sirloin",
    category: "fresh-meat",
    description: "Fresh beef sirloin per kg",
    unit_cost: 350.00,
    sale_price: 499.00,
    price: 499.00,
    current_qty: 10,
    total_stock: 10,
    reorder_point: 5,
    reorder_level: 5,
    barcode: "9501234567003",
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Frozen Peas",
    category: "frozen",
    description: "Frozen green peas 1kg",
    unit_cost: 75.00,
    sale_price: 110.00,
    price: 110.00,
    current_qty: 30,
    total_stock: 30,
    reorder_point: 12,
    reorder_level: 12,
    barcode: "9501234567004",
    image_url: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Frozen Pizza",
    category: "ready-heat",
    description: "Ready to heat frozen pizza",
    unit_cost: 120.00,
    sale_price: 189.00,
    price: 189.00,
    current_qty: 25,
    total_stock: 25,
    reorder_point: 10,
    reorder_level: 10,
    barcode: "9501234567005",
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Marinated Chicken",
    category: "ready-cook",
    description: "Ready to cook marinated chicken",
    unit_cost: 150.00,
    sale_price: 230.00,
    price: 230.00,
    current_qty: 18,
    total_stock: 18,
    reorder_point: 8,
    reorder_level: 8,
    barcode: "9501234567006",
    image_url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Fresh Milk",
    category: "chilled-dairy",
    description: "Fresh chilled milk 1L",
    unit_cost: 80.00,
    sale_price: 115.00,
    price: 115.00,
    current_qty: 40,
    total_stock: 40,
    reorder_point: 15,
    reorder_level: 15,
    barcode: "9501234567007",
    image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop",
    is_active: true,
    expiry_date: "2026-06-15"
  },
  {
    name: "Sourdough Bread",
    category: "bakery",
    description: "Fresh baked sourdough bread",
    unit_cost: 65.00,
    sale_price: 99.00,
    price: 99.00,
    current_qty: 22,
    total_stock: 22,
    reorder_point: 8,
    reorder_level: 8,
    barcode: "9501234567008",
    image_url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Pasta",
    category: "international",
    description: "Italian pasta 500g",
    unit_cost: 55.00,
    sale_price: 85.00,
    price: 85.00,
    current_qty: 45,
    total_stock: 45,
    reorder_point: 15,
    reorder_level: 15,
    barcode: "9501234567009",
    image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Rice",
    category: "pantry",
    description: "Jasmine rice 5kg",
    unit_cost: 180.00,
    sale_price: 260.00,
    price: 260.00,
    current_qty: 55,
    total_stock: 55,
    reorder_point: 20,
    reorder_level: 20,
    barcode: "9501234567010",
    image_url: "https://images.unsplash.com/photo-1553177603-c82e36394891?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Potato Chips",
    category: "snacks",
    description: "Potato chips 100g",
    unit_cost: 25.00,
    sale_price: 39.00,
    price: 39.00,
    current_qty: 100,
    total_stock: 100,
    reorder_point: 30,
    reorder_level: 30,
    barcode: "9501234567011",
    image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Orange Juice",
    category: "beverages",
    description: "Orange juice 1L",
    unit_cost: 70.00,
    sale_price: 99.00,
    price: 99.00,
    current_qty: 40,
    total_stock: 40,
    reorder_point: 15,
    reorder_level: 15,
    barcode: "9501234567012",
    image_url: "https://images.unsplash.com/photo-1559181567-c3190ca11a89?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Moisturizer",
    category: "health-beauty",
    description: "Facial moisturizer",
    unit_cost: 150.00,
    sale_price: 220.00,
    price: 220.00,
    current_qty: 30,
    total_stock: 30,
    reorder_point: 10,
    reorder_level: 10,
    barcode: "9501234567013",
    image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Toothpaste",
    category: "home-care",
    description: "Toothpaste 150g",
    unit_cost: 45.00,
    sale_price: 69.00,
    price: 69.00,
    current_qty: 60,
    total_stock: 60,
    reorder_point: 20,
    reorder_level: 20,
    barcode: "9501234567014",
    image_url: "https://images.unsplash.com/photo-1581594723685-8e6066857808?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Pet Food",
    category: "pet-care",
    description: "Dog food 1kg",
    unit_cost: 120.00,
    sale_price: 175.00,
    price: 175.00,
    current_qty: 25,
    total_stock: 25,
    reorder_point: 10,
    reorder_level: 10,
    barcode: "9501234567015",
    image_url: "https://images.unsplash.com/photo-1568640347023-a616a006bbbc?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    name: "Soap",
    category: "health-hygiene",
    description: "Antibacterial soap",
    unit_cost: 25.00,
    sale_price: 39.00,
    price: 39.00,
    current_qty: 80,
    total_stock: 80,
    reorder_point: 25,
    reorder_level: 25,
    barcode: "9501234567016",
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=300&fit=crop",
    is_active: true
  }
];

async function insertProducts() {
  try {
    console.log("Inserting sample products...");

    for (const product of sampleProducts) {
      await db.query(
        `INSERT INTO products (
          barcode, name, description, category, category_id,
          unit_cost, sale_price, price, current_qty, reorder_point, reorder_level,
          expiry_date, image_url, supplier_id, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.barcode,
          product.name,
          product.description,
          product.category,
          null,
          product.unit_cost,
          product.sale_price,
          product.price,
          product.current_qty,
          product.reorder_point,
          product.reorder_level,
          product.expiry_date || null,
          product.image_url,
          null,
          product.is_active
        ]
      );
    }

    console.log("✅ All sample products inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting products:", err);
    process.exit(1);
  }
}

insertProducts();
