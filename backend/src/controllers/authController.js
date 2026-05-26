const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const buildUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,

    defaultOrderNote: user.defaultOrderNote,
    deliveryPreferences: user.deliveryPreferences,
    dietaryPreferences: user.dietaryPreferences,
    customerTags: user.customerTags,
    categoryOrderCounts: user.categoryOrderCounts,
    totalSpent: user.totalSpent,
    coupons: user.coupons,
    loyaltyPoints: user.loyaltyPoints,

    businessName: user.businessName,
    businessDescription: user.businessDescription,
    businessAddress: user.businessAddress,
    businessPhone: user.businessPhone,
    vendorStatus: user.vendorStatus,
    vendorRejectionReason: user.vendorRejectionReason,

    token: generateToken(user._id),
  };
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, dietaryPreferences } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: "student",
      vendorStatus: "none",
      dietaryPreferences: dietaryPreferences || [],
    });

    return res.status(201).json(buildUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
    } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        message: "Name, email, password and business name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: "vendor",
      businessName,
      businessDescription: businessDescription || "",
      businessAddress: businessAddress || "",
      businessPhone: businessPhone || phone || "",
      vendorStatus: "pending",
    });

    return res.status(201).json({
      ...buildUserResponse(vendor),
      message: "Vendor account registered. Please wait for admin approval.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account has been disabled",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    return res.json(buildUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  return res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name ?? user.name;
    user.phone = req.body.phone ?? user.phone;
    user.defaultOrderNote = req.body.defaultOrderNote ?? user.defaultOrderNote;

    if (req.body.deliveryPreferences) {
      user.deliveryPreferences.defaultAddress =
        req.body.deliveryPreferences.defaultAddress ??
        user.deliveryPreferences.defaultAddress;

      user.deliveryPreferences.defaultDeliveryTime =
        req.body.deliveryPreferences.defaultDeliveryTime ??
        user.deliveryPreferences.defaultDeliveryTime;
    }

    if (Array.isArray(req.body.dietaryPreferences)) {
      user.dietaryPreferences = req.body.dietaryPreferences;
    }

    if (req.body.email) {
      const existingUser = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = req.body.email.toLowerCase();
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    return res.json(buildUserResponse(updatedUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  registerVendor,
  loginUser,
  getProfile,
  updateProfile,
};