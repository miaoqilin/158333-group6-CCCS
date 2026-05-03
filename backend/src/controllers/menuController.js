const MenuItem = require("../models/MenuItem");

const getMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find().sort({ createdAt: -1 });
    return res.json(menu);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Name, description, price and category are required",
      });
    }

    const newItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      image: image || "",
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.name = req.body.name ?? item.name;
    item.description = req.body.description ?? item.description;
    item.price = req.body.price ?? item.price;
    item.category = req.body.category ?? item.category;
    item.image = req.body.image ?? item.image;
    item.isAvailable = req.body.isAvailable ?? item.isAvailable;

    const updatedItem = await item.save();

    return res.json(updatedItem);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await item.deleteOne();

    return res.json({ message: "Menu item removed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMenu,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};