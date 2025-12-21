// ministock-server/db.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Database file
const DB_SOURCE = path.join(__dirname, 'ministock.sqlite');

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error('❌ Error opening database', err.message);
        throw err;
    } else {
        console.log('✅ Connected to the ministock SQLite database.');
        db.serialize(() => {
            // Users table
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.run(createUsersTable, (err) => {
                if (err) console.error("❌ Error creating 'users' table", err);
                else console.log("👍 'users' table is ready.");
            });

            // Items table with user_id
            const createItemTable = `
                CREATE TABLE IF NOT EXISTS Item (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    category TEXT DEFAULT 'Uncategorized',
                    stock_quantity INTEGER DEFAULT 0,
                    restock_level INTEGER NOT NULL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `;
            db.run(createItemTable, (err) => {
                if (err) console.error("❌ Error creating 'Item' table", err);
                else console.log("👍 'Item' table is ready.");
            });

            // Seed demo user
            const demoEmail = 'demo@example.com';
            const demoPassword = 'demopassword';

            bcrypt.hash(demoPassword, 10, (err, hashedPassword) => {
                if (err) {
                    console.error("❌ Error hashing demo password", err);
                    return;
                }
                const insertDemoUser = `INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)`;
                db.run(insertDemoUser, [demoEmail, hashedPassword], function(err) {
                    if (err) console.error("❌ Error seeding demo user", err);
                    else if (this.changes > 0) console.log(`🔑 Demo user created. Email: ${demoEmail}, Password: ${demoPassword}`);
                });
            });
        });
    }
});

// --- Helper functions for items per user ---

/**
 * Add an item for a specific user
 */
function addItem(userId, id, name, category = 'Uncategorized', stock = 0, restockLevel = 0) {
    const sql = `
        INSERT INTO Item (id, user_id, name, category, stock_quantity, restock_level)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [id, userId, name, category, stock, restockLevel], function(err) {
        if (err) return console.error("❌ Error adding item:", err.message);
        console.log(`✅ Item added for user ${userId}. ID: ${id}`);
    });
}

/**
 * Get all items for a specific user
 */
function getItems(userId, callback) {
    const sql = `SELECT * FROM Item WHERE user_id = ?`;
    db.all(sql, [userId], (err, rows) => {
        if (err) return callback(err, null);
        callback(null, rows);
    });
}

/**
 * Update an item for a specific user
 */
function updateItem(userId, id, fields = {}) {
    const updates = [];
    const values = [];

    for (let key in fields) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
    }

    if (updates.length === 0) return;

    values.push(id, userId); // For WHERE clause
    const sql = `UPDATE Item SET ${updates.join(', ')}, last_updated = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    db.run(sql, values, function(err) {
        if (err) return console.error("❌ Error updating item:", err.message);
        console.log(`✅ Item ${id} updated for user ${userId}`);
    });
}

/**
 * Delete an item for a specific user
 */
function deleteItem(userId, id) {
    const sql = `DELETE FROM Item WHERE id = ? AND user_id = ?`;
    db.run(sql, [id, userId], function(err) {
        if (err) return console.error("❌ Error deleting item:", err.message);
        console.log(`🗑️ Item ${id} deleted for user ${userId}`);
    });
}

// Export db and helper functions
module.exports = {
    db,           
    addItem,      
    getItems,
    updateItem,
    deleteItem
};
