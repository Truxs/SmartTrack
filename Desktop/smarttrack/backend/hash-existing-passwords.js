const db = require('./config/db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function hashExistingPasswords() {
    console.log('Starting password hashing migration...');
    
    try {
        // Get all users
        const [users] = await db.query('SELECT id, username, password FROM users');
        
        if (users.length === 0) {
            console.log('No users found.');
            process.exit(0);
        }
        
        console.log(`Found ${users.length} users to process.`);
        
        let updatedCount = 0;
        
        for (const user of users) {
            // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
                console.log(`User ${user.username} already has a hashed password. Skipping.`);
                continue;
            }
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
            
            // Update the user
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
            
            console.log(`Updated password for user: ${user.username}`);
            updatedCount++;
        }
        
        console.log(`\n✅ Migration complete! Updated ${updatedCount} user passwords.`);
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error during migration:', err);
        process.exit(1);
    }
}

hashExistingPasswords();