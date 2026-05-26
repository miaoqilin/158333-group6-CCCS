const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found for this token" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "This account has been disabled" });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "No token provided" });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Admin access only" });
};

const vendor = (req, res, next) => {
  if (req.user && req.user.role === "vendor") {
    if (req.user.vendorStatus !== "approved") {
      return res.status(403).json({
        message: "Vendor account is not approved yet",
      });
    }

    return next();
  }

  return res.status(403).json({ message: "Vendor access only" });
};

const adminOrVendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.role === "vendor" && req.user.vendorStatus === "approved") {
    return next();
  }

  return res.status(403).json({ message: "Admin or approved vendor access only" });
};

module.exports = { protect, admin, vendor, adminOrVendor };