const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Support & Legal Assistance for Single Mothers'
    });
});

router.get('/auth', (req, res) => {
    res.render('auth', {
        title: 'Sign In or Register'
    });
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        title: 'Assistance Dashboard'
    });
});

module.exports = router;