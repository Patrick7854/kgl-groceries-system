// ========================================
// Sale Controller - Handles cash sales
// ========================================

const Sale = require('../models/Sale');
const Produce = require('../models/Produce');
const User = require('../models/User');  // ← ADD THIS LINE

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (All roles)
const getSales = async (req, res) => {
    try {
        let query = {};
        
        // Filter by branch based on role
        if (req.user.role === 'Manager' || req.user.role === 'Sales') {
            query.branch = req.user.branch;
        }
        
        const sales = await Sale.find(query).sort({ dateTime: -1 });
        
        res.json({
            success: true,
            sales
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private (Manager and Sales Agent)
const createSale = async (req, res) => {
    try {
        console.log('🔍 DEBUG - req.user:', req.user); 
        const { produceName, quantity, amountPaid, buyerName } = req.body;

        // Validate required fields
        if (!produceName || !quantity || !amountPaid || !buyerName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Find the produce to check stock
        const produce = await Produce.findOne({ 
            name: produceName, 
            branch: req.user.branch 
        }).sort({ createdAt: -1 });

        if (!produce) {
            return res.status(400).json({
                success: false,
                message: 'Produce not found in this branch'
            });
        }

        // Check if enough stock
        if (produce.tonnage < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${produce.tonnage}kg available`
            });
        }

        // Get the full user details from database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create the sale
        const sale = new Sale({
            produceName,
            quantity,
            amountPaid,
            buyerName,
            salesAgent: user.name,  // ← FIXED: using user.name from database
            branch: req.user.branch,
            dateTime: new Date()
        });

        await sale.save();

        // Reduce stock
        produce.tonnage -= quantity;
        await produce.save();

        res.status(201).json({
            success: true,
            sale,
            message: 'Sale recorded successfully'
        });

    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get sales by date range
// @route   GET /api/sales/report
// @access  Private (Manager and Director)
const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = {};
        
        if (req.user.role === 'Manager' || req.user.role === 'Sales') {
            query.branch = req.user.branch;
        }
        
        if (startDate && endDate) {
            query.dateTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const sales = await Sale.find(query).sort({ dateTime: -1 });
        
        // Calculate totals
        const totalAmount = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);
        const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        res.json({
            success: true,
            sales,
            summary: {
                totalSales: sales.length,
                totalAmount,
                totalQuantity
            }
        });
        
    } catch (error) {
        console.error('Get sales report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getSales,
    createSale,
    getSalesReport
};