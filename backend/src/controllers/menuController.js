const MenuItem = require("../models/MenuItem");

const validateMenuPayload = ({ name, description, price, category, dietaryCategory }) => {
  if (!name || !description || price === undefined || !category || !dietaryCategory) {
    return "Name, description, price, category and dietary category are required";
  }

  const categories = ["coffee", "food", "drink", "dessert", "snack", "meal", "catering"];
  const dietaryCategories = ["meat", "vegetarian", "vegan", "gluten_free"];

  if (!categories.includes(category)) {
    return "Invalid category";
  }

  if (!dietaryCategories.includes(dietaryCategory)) {
    return "Invalid dietary category";
  }

  if (Number(price) < 0) {
    return "Price must be greater than or equal to 0";
  }

  return null;
};

const getMenu = async (req, res) => {
  try {
    const { category, dietaryCategory, search, itemType } = req.query;

    const filter = {
      approvalStatus: "approved",
      isAvailable: true,
    };

    if (category) filter.category = category;
    if (dietaryCategory) filter.dietaryCategory = dietaryCategory;
    if (itemType) filter.itemType = itemType;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const menu = await MenuItem.find(filter)
      .populate("vendor", "name businessName businessDescription businessPhone")
      .sort({ createdAt: -1 });

    return res.json(menu);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate(
      "vendor",
      "name businessName businessDescription businessPhone"
    );

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (item.approvalStatus !== "approved" || !item.isAvailable) {
      return res.status(404).json({ message: "Menu item is not available" });
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      dietaryCategory,
      itemType,
      packageItems,
      image,
      isAvailable,
      vendor,
    } = req.body;

    const validationError = validateMenuPayload({
      name,
      description,
      price,
      category,
      dietaryCategory,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const finalItemType = itemType || "single";

    if (finalItemType === "package" && (!Array.isArray(packageItems) || packageItems.length === 0)) {
      return res.status(400).json({
        message: "Package items are required when itemType is package",
      });
    }

    const newItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      dietaryCategory,
      itemType: finalItemType,
      packageItems: finalItemType === "package" ? packageItems : [],
      image: image || "",
      vendor: vendor || null,
      submittedBy: req.user._id,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      approvalStatus: "approved",
      rejectionReason: "",
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
    item.dietaryCategory = req.body.dietaryCategory ?? item.dietaryCategory;
    item.image = req.body.image ?? item.image;
    item.isAvailable = req.body.isAvailable ?? item.isAvailable;
    item.vendor = req.body.vendor ?? item.vendor;

    if (req.body.itemType) {
      item.itemType = req.body.itemType;
    }

    if (Array.isArray(req.body.packageItems)) {
      item.packageItems = req.body.packageItems;
    }

    if (req.body.approvalStatus) {
      item.approvalStatus = req.body.approvalStatus;
    }

    if (req.body.rejectionReason !== undefined) {
      item.rejectionReason = req.body.rejectionReason;
    }

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

const createVendorMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      dietaryCategory,
      itemType,
      packageItems,
      image,
    } = req.body;

    const validationError = validateMenuPayload({
      name,
      description,
      price,
      category,
      dietaryCategory,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const finalItemType = itemType || "single";

    if (finalItemType === "package" && (!Array.isArray(packageItems) || packageItems.length === 0)) {
      return res.status(400).json({
        message: "Package items are required when itemType is package",
      });
    }

    const newItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      dietaryCategory,
      itemType: finalItemType,
      packageItems: finalItemType === "package" ? packageItems : [],
      image: image || "",
      vendor: req.user._id,
      submittedBy: req.user._id,
      isAvailable: false,
      approvalStatus: "pending",
      rejectionReason: "",
    });

    return res.status(201).json({
      message: "Menu item submitted for admin approval",
      item: newItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyVendorMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ vendor: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateVendorMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (!item.vendor || item.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own menu items",
      });
    }

    item.name = req.body.name ?? item.name;
    item.description = req.body.description ?? item.description;
    item.price = req.body.price ?? item.price;
    item.category = req.body.category ?? item.category;
    item.dietaryCategory = req.body.dietaryCategory ?? item.dietaryCategory;
    item.image = req.body.image ?? item.image;

    if (req.body.itemType) {
      item.itemType = req.body.itemType;
    }

    if (Array.isArray(req.body.packageItems)) {
      item.packageItems = req.body.packageItems;
    }

    item.approvalStatus = "pending";
    item.isAvailable = false;
    item.rejectionReason = "";

    const updatedItem = await item.save();

    return res.json({
      message: "Menu item updated and submitted for admin review",
      item: updatedItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const vendorToggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (!item.vendor || item.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only manage your own menu items",
      });
    }

    if (item.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Only approved items can be toggled available or unavailable",
      });
    }

    item.isAvailable = !item.isAvailable;

    const updatedItem = await item.save();

    return res.json(updatedItem);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate("vendor", "name email businessName vendorStatus")
      .populate("submittedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPendingMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ approvalStatus: "pending" })
      .populate("vendor", "name email businessName")
      .populate("submittedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const approveMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.approvalStatus = "approved";
    item.isAvailable = true;
    item.rejectionReason = "";

    const updatedItem = await item.save();

    return res.json({
      message: "Menu item approved",
      item: updatedItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const rejectMenuItem = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.approvalStatus = "rejected";
    item.isAvailable = false;
    item.rejectionReason = rejectionReason || "Rejected by admin";

    const updatedItem = await item.save();

    return res.json({
      message: "Menu item rejected",
      item: updatedItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const adminToggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (item.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Only approved items can be listed or unlisted",
      });
    }

    item.isAvailable = !item.isAvailable;

    const updatedItem = await item.save();

    return res.json(updatedItem);
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

  createVendorMenuItem,
  getMyVendorMenuItems,
  updateVendorMenuItem,
  vendorToggleAvailability,

  getAllMenuItems,
  getPendingMenuItems,
  approveMenuItem,
  rejectMenuItem,
  adminToggleAvailability,
};