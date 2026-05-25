const db = require('./config/db');

async function updateAdminPassword() {
    try {
        console.log('Updating admin password...');
        
        // Update admin password
        await db.query(
            "UPDATE users SET password = ? WHERE username = 'admin'",
            ['@dm1n@dm1n']
        );
        
        console.log('✅ Admin password updated successfully to @dm1n@dm1n');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error updating admin password:', err.message);
        process.exit(1);
    }
}

updateAdminPassword();
