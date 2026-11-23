const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Protect all admin routes with JWT auth + admin role check
router.use(authMiddleware, adminMiddleware);

// --- REQUEST MANAGEMENT ---

// Get all assistance requests with user & provider details
router.get('/requests', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                r.id,
                r.issue_category,
                r.urgency,
                r.description,
                r.status,
                r.created_at,
                u.full_name AS user_name,
                u.email AS user_email,
                u.phone AS user_phone,
                p.name AS provider_name,
                p.city AS provider_city
            FROM assistance_requests r
            JOIN users u ON r.user_id = u.id
            JOIN service_providers p ON r.provider_id = p.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load assistance requests.' });
    }
});

// Update request status
router.patch('/requests/:id/status', async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Reviewed', 'Connected', 'Closed'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE assistance_requests SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        res.json({ message: `Request status updated to ${status}.` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update request status.' });
    }
});

// --- SERVICE PROVIDER MANAGEMENT ---

// List all providers
router.get('/providers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM service_providers ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load service providers.' });
    }
});

// Add a new provider
router.post('/providers', async (req, res) => {
    const { name, category, description, address, city, contact_phone, contact_email, is_free } = req.body;
    if (!name || !category || !description || !address || !city || !contact_phone) {
        return res.status(400).json({ message: 'Please fill in all required provider fields.' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO service_providers
             (name, category, description, address, city, contact_phone, contact_email, is_free)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                category,
                description,
                address,
                city,
                contact_phone,
                contact_email || null,
                is_free === false ? false : true
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Service provider added.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add service provider.' });
    }
});

// Delete a provider
router.delete('/providers/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM service_providers WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Provider not found.' });
        }
        res.json({ message: 'Service provider removed.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete provider.' });
    }
});

// --- USER MANAGEMENT (VIEW USERS) ---

// List registered users (excluding password_hash)
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, phone, location, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load users.' });
    }
});

module.exports = router;