const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = 'your-secret-key-change-in-production';

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check by email
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );
        
        if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
        
        const user = users[0];
        // Compare password against stored password
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, name: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.username } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if email already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Generate username from email
        const username = email.split('@')[0];
        
        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
            [username, email, password, 'user']
        );
        
        // Generate token for new user
        const token = jwt.sign(
            { id: result.insertId, username: username, role: 'user', name: username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            user: { id: result.insertId, username: username, role: 'user', name: username } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied. Admin only.' });
    next();
};

module.exports = { router, authenticate, requireAdmin };
