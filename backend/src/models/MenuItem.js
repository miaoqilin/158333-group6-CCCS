const mongoose = require("mongoose");

const menuItemSchema = mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String,
});

module.exports = mongoose.model("MenuItem", menuItemSchema);