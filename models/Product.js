const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String, // e.g., "Baby Care", "Vitamins"
        required: true,
    },
    subCategory: { 
        type: String, // e.g., "Diapers" <--- ADD THIS
        required: true },
    brand: {
        type: String, // e.g., "SoftBloom"
        required: true
    },
    price: {
        type: Number, // The current selling price (e.g., 59.90)
        required: true
    },
    originalPrice: {
        type: Number, // The crossed-out price (e.g., 79.90)
    },
    rating: {
        type: Number, // e.g., 4.8
        default: 0
    },
    numReviews: {
        type: Number, // e.g., 1234
        default: 0
    },
    image: {
        type: String, // URL to the image
        required: true
    },
    isPrescriptionRequired: {
        type: Boolean,
        default: false // Set to true for strict medicines
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0
    },
    tags: [{ type: String }] // e.g., ["New", "Sale", "-25%"] - useful for badges - KEEP: Client can optionally add "fever", "bukhar", "pain" here
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;