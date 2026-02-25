// ========================================
// Credit Sale Model - Records credit transactions
// ========================================

const mongoose = require('mongoose');

const creditSaleSchema = new mongoose.Schema({
    buyerName: {
        type: String,
        required: [true, 'Buyer name is required']
    },
    nin: {
        type: String,
        required: [true, 'National ID (NIN) is required'],
        match: [/^[A-Z0-9]{14}$/, 'NIN must be 14 alphanumeric characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    contact: {
        type: String,
        required: [true, 'Contact is required'],
        match: [/^(?:\+256|0)[0-9]{9}$/, 'Please enter a valid Ugandan phone number']
    },
    amountDue: {
        type: Number,
        required: [true, 'Amount due is required'],
        min: [0, 'Amount cannot be negative']
    },
    salesAgent: {
        type: String,
        required: [true, 'Sales agent name is required']
    },
    produceName: {
        type: String,
        required: [true, 'Produce name is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1kg']
    },
    dueDate: {
        type: String,
        required: [true, 'Due date is required']
    },
    dispatchDate: {
        type: String,
        required: [true, 'Dispatch date is required']
    },
    branch: {
        type: String,
        required: [true, 'Branch is required'],
        enum: ['MAGANJO', 'MATUGGA']
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CreditSale', creditSaleSchema);