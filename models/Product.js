const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Product name is required'], trim: true, minlength: 2 },
    price: { type: Number, required: true, min: 0 },
    stock: {
        type: Number,
        required: true,
        min: 0,
        validate: { validator: Number.isInteger, message: 'Stock must be a whole number' }
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true } // Reference
});
module.exports = mongoose.model('Product', productSchema);
