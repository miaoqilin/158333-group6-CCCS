const mongoose = require('mongoose');

// Order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [
    {
      menu: Object,
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: {
    type: String,
    default: 'Pending' // Pending, Preparing, Completed, Cancelled
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);