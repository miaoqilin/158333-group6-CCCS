const mongoose = require("mongoose");

const packageComponentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than or equal to 0"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["coffee", "food", "drink", "dessert", "snack", "meal", "catering"],
    },

    dietaryCategory: {
      type: String,
      required: [true, "Dietary category is required"],
      enum: ["meat", "vegetarian", "vegan", "gluten_free"],
      default: "meat",
    },

    itemType: {
      type: String,
      enum: ["single", "package"],
      default: "single",
    },

    packageItems: {
      type: [packageComponentSchema],
      default: [],
    },

    image: {
      type: String,
      default: "",
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    feedbackCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);