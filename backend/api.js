const express = require('express');
const router = express.Router();   
const { db, addItem, getItems, updateItem, deleteItem } = require('./db');
const { v4: uuidv4 } = require('uuid'); 
const { authenticateToken } = require('./auth'); // use auth middleware

// ----------------------------------------------------------------
// ITEM ROUTES (USER-SPECIFIC)
// ----------------------------------------------------------------

// GET /api/items: List all items for logged-in user (with optional search)
router.get('/items', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const searchTerm = req.query.search;

    getItems(userId, (err, rows) => {
        if (err) {
            console.error('❌ GET /items error:', err.message);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch items: ' + err.message });
        }

        let filtered = rows;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = rows.filter(r => r.name.toLowerCase().includes(term) || r.category.toLowerCase().includes(term));
        }

        console.log(`✅ GET /items: Retrieved ${filtered.length} items for user ${userId}`);
        res.json({ status: 'ok', data: filtered });
    });
});

// POST /api/items: Create a new item for logged-in user
router.post('/items', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { name, category, restock_level } = req.body;
    const id = uuidv4();

    if (!name || !restock_level) {
        return res.status(400).json({ status: 'error', message: 'Name and Restock Level are required.' });
    }

    addItem(userId, id, name, category || 'Uncategorized', 0, restock_level);
    console.log(`✅ POST /items: Created item "${name}" for user ${userId} with ID ${id}`);
    res.status(201).json({ status: 'ok', message: 'Item created successfully.', data: { id, name, category: category || 'Uncategorized', stock_quantity: 0, restock_level } });
});

// POST /api/items/:id/adjust: Update stock for user-specific item
router.post('/items/:id/adjust', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const itemId = req.params.id;
    const { change_amount } = req.body;
    const change = parseInt(change_amount, 10);

    if (isNaN(change) || change === 0) {
        return res.status(400).json({ status: 'error', message: 'A valid, non-zero change amount is required.' });
    }

    db.get('SELECT stock_quantity FROM Item WHERE id = ? AND user_id = ?', [itemId, userId], (err, row) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        if (!row) return res.status(404).json({ status: 'error', message: 'Item not found.' });

        const newStock = row.stock_quantity + change;
        if (newStock < 0) return res.status(400).json({ status: 'error', message: 'Insufficient stock.' });

        updateItem(userId, itemId, { stock_quantity: newStock });
        console.log(`✅ [STOCK ADJUSTMENT] Item ${itemId}, Change: ${change}, New Stock: ${newStock} for user ${userId}`);
        res.json({ status: 'ok', message: 'Stock adjusted successfully.', data: { id: itemId, stock_quantity: newStock } });
    });
});

// DELETE /api/items/:id: Delete item for logged-in user
router.delete('/items/:id', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const itemId = req.params.id;

    db.get('SELECT id FROM Item WHERE id = ? AND user_id = ?', [itemId, userId], (err, row) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        if (!row) return res.status(404).json({ status: 'error', message: 'Item not found.' });

        deleteItem(userId, itemId);
        console.log(`✅ DELETE /items/:id: Item ${itemId} deleted for user ${userId}`);
        res.sendStatus(204);
    });
});

module.exports = router;
