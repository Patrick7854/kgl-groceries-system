// ========================================
// KARIBU GROCERIES BACKEND - server.js
// ========================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Import Routes
// ========================================
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const produceRoutes = require('./routes/produceRoutes');
const saleRoutes = require('./routes/saleRoutes');
const creditSaleRoutes = require('./routes/creditSaleRoutes');
const reportRoutes = require('./routes/reportRoutes');

// ========================================
// Use Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/creditsales', creditSaleRoutes);
app.use('/api/reports', reportRoutes);

// ========================================
// Test route
// ========================================
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '🎉 Backend is working!',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// MongoDB Connection
// ========================================
console.log('🔄 Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ SUCCESS! Connected to MongoDB');
        console.log('📦 Database: kgl_groceries');
    })
    .catch((error) => {
        console.log('❌ FAILED! Could not connect to MongoDB');
        console.log('Error:', error.message);
    });

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📝 Test URL: http://localhost:${PORT}/api/test`);
    console.log(`🔑 Login URL: http://localhost:${PORT}/api/auth/login`);
});