const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    // LINK TO USER MODEL (optional for guest orders)
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    },
    
    // Order Details
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            // Optional: Store prescription image if uploaded
            prescriptionImage: { type: String } 
        },
    ],
    
    // Shipping Info (Snapshotted at time of order)
    shippingAddress: { 
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'India' },
        phone: { type: String },
        name: { type: String },
        email: { type: String }
    },

    // Payment & Status
    paymentMethod: { type: String, required: true, default: 'COD' },
    paymentResult: { // For future Gateway integration
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    
    // Order Status for Admin Panel
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending' 
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;