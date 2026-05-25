USE grocery_inventory;

-- Add email column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL UNIQUE;

-- Update sample users with emails
UPDATE users SET email = 'admin@smarttrack.com' WHERE username = 'admin';
UPDATE users SET email = 'user@smarttrack.com' WHERE username = 'user';
