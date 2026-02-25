// ========================================
// Produce Controller - Handles stock management
// ========================================

const Produce = require('../models/Produce');

// @desc    Get all produce (stock)
// @route   GET /api/produce
// @access  Private (All roles can view)
const getProduce = async (req, res) => {
    try {
        let query = {};
        
        // If user is Manager or Sales, filter by their branch
        if (req.user.role === 'Manager' || req.user.role === 'Sales') {
            query.branch = req.user.branch;
        }
        
        // Optional branch filter in query params
        if (req.query.branch) {
            query.branch = req.query.branch;
        }

        const produce = await Produce.find(query).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            produce
        });
    } catch (error) {
        console.error('Get produce error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create new produce (procurement)
// @route   POST /api/produce
// @access  Private (Manager only)
const createProduce = async (req, res) => {
    try {
        const {
            name, type, tonnage, cost, dealerName,
            dealerContact, sellingPrice, branch, date, time
        } = req.body;

        // Validate required fields
        if (!name || !type || !tonnage || !cost || !dealerName || 
            !dealerContact || !sellingPrice || !branch || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate tonnage (minimum 1000kg for procurement)
        if (tonnage < 1000) {
            return res.status(400).json({
                success: false,
                message: 'Tonnage must be at least 1000kg for procurement'
            });
        }

        // Create new produce
        const newProduce = new Produce({
            name, type, tonnage, cost, dealerName,
            dealerContact, sellingPrice, branch, date, time
        });

        await newProduce.save();

        res.status(201).json({
            success: true,
            produce: newProduce,
            message: 'Procurement recorded successfully'
        });

    } catch (error) {
        console.error('Create produce error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update produce (e.g., adjust price)
// @route   PUT /api/produce/:id
// @access  Private (Manager only)
const updateProduce = async (req, res) => {
    try {
        const { id } = req.params;
        const { sellingPrice } = req.body;

        const produce = await Produce.findById(id);
        
        if (!produce) {
            return res.status(404).json({
                success: false,
                message: 'Produce not found'
            });
        }

        // Only allow updating selling price
        if (sellingPrice) {
            produce.sellingPrice = sellingPrice;
        }

        await produce.save();

        res.json({
            success: true,
            produce,
            message: 'Produce updated successfully'
        });

    } catch (error) {
        console.error('Update produce error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete produce
// @route   DELETE /api/produce/:id
// @access  Private (Manager only)
const deleteProduce = async (req, res) => {
    try {
        const { id } = req.params;

        const produce = await Produce.findById(id);
        
        if (!produce) {
            return res.status(404).json({
                success: false,
                message: 'Produce not found'
            });
        }

        await Produce.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Produce deleted successfully'
        });

    } catch (error) {
        console.error('Delete produce error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getProduce,
    createProduce,
    updateProduce,
    deleteProduce
};