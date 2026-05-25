const db = require('./config/db');

async function updateDatabase() {
    try {
        console.log('Checking users table...');
        
        // Check if email column exists
        const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'email'");
        
        if (columns.length === 0) {
            console.log('Adding email column to users table (without unique first)...');
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN email VARCHAR(255)
            `);
            
            // Set default emails for existing users
            console.log('Setting emails for existing users...');
            await db.query("UPDATE users SET email = 'admin@smarttrack.com' WHERE username = 'admin'");
            await db.query("UPDATE users SET email = 'user@smarttrack.com' WHERE username = 'user'");
            await db.query("UPDATE users SET email = CONCAT(username, '@smarttrack.com') WHERE email IS NULL OR email = ''");
            
            // Now add unique constraint
            console.log('Adding unique constraint to email column...');
            await db.query(`
                ALTER TABLE users 
                MODIFY COLUMN email VARCHAR(255) NOT NULL UNIQUE
            `);
            
            console.log('✅ Email column added successfully!');
        } else {
            console.log('✅ Email column already exists');
            
            // Make sure existing users have emails
            console.log('Verifying emails for existing users...');
            await db.query("UPDATE users SET email = 'admin@smarttrack.com' WHERE username = 'admin' AND (email IS NULL OR email = '')");
            await db.query("UPDATE users SET email = 'user@smarttrack.com' WHERE username = 'user' AND (email IS NULL OR email = '')");
            await db.query("UPDATE users SET email = CONCAT(username, '@smarttrack.com') WHERE email IS NULL OR email = ''");
        }
        
        console.log('✅ Database update complete!');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error updating database:', err.message);
        process.exit(1);
    }
}

updateDatabase();
