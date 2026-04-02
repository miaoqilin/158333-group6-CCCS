const mongoose = require('mongoose');

// Menu item schema
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  image: String
});

module.exports = mongoose.model('Menu', menuSchema);