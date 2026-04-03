const Menu = require('../models/Menu');

// Get all menu items
exports.getMenu = async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new menu item
exports.addMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update menu item
exports.updateMenu = async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete menu item
exports.deleteMenu = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};