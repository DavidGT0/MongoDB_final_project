const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference
    quantity: {
        type: Number,
        required: true,
        min: 1,
        validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' }
    },
    price: { type: Number, required: true, min: 0 } // מחיר ליחידה בזמן ההזמנה
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference
    products: { // מערכים
        type: [orderItemSchema],
        validate: { validator: items => items.length > 0, message: 'Order must contain at least one product' }
    },
    totalPrice: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
