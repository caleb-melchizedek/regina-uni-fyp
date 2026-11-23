const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const viewRoutes = require('./routes/viewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets (CSS, client JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Page routes (EJS)
app.use('/', viewRoutes);

// API routes (JSON + JWT)
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));