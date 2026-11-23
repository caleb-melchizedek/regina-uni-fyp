const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get matched providers based on problem category & optional city
router.get('/', authMiddleware, async (req, res) => {
    const { category, city } = req.query;
    try {
        let query = 'SELECT * FROM service_providers WHERE 1=1';
        const params = [];

        if (category && category !== 'All') {
            query += ' AND category = ?';
            params.push(category);
        }
        if (city) {
            query += ' AND city LIKE ?';
            params.push(`%${city}%`);
        }

        const [providers] = await db.query(query, params);
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch service providers.' });
    }
});

// Submit a formal assistance request to a selected provider
router.post('/request', authMiddleware, async (req, res) => {
    const { provider_id, issue_category, urgency, description } = req.body;
    const user_id = req.user.id;

    try {
        await db.query(
            'INSERT INTO assistance_requests (user_id, provider_id, issue_category, urgency, description) VALUES (?, ?, ?, ?, ?)',
            [user_id, provider_id, issue_category, urgency, description]
        );
        res.status(201).json({ message: 'Assistance request submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting request.' });
    }
});

// Get logged-in user's request history
router.get('/my-requests', authMiddleware, async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT r.*, p.name AS provider_name, p.contact_phone 
             FROM assistance_requests r 
             JOIN service_providers p ON r.provider_id = p.id 
             WHERE r.user_id = ? ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error loading your requests.' });
    }
});

module.exports = router;