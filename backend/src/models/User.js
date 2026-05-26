const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 5,
      min: 0,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["student", "vendor", "admin"],
      default: "student",
    },

    phone: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    defaultOrderNote: {
      type: String,
      default: "",
    },

    deliveryPreferences: {
      defaultAddress: {
        type: String,
        default: "",
      },
      defaultDeliveryTime: {
        type: String,
        default: "",
      },
    },

    dietaryPreferences: {
      type: [String],
      default: [],
    },

    customerTags: {
      type: [String],
      default: [],
    },

    categoryOrderCounts: {
      meat: {
        type: Number,
        default: 0,
      },
      vegetarian: {
        type: Number,
        default: 0,
      },
      vegan: {
        type: Number,
        default: 0,
      },
      gluten_free: {
        type: Number,
        default: 0,
      },
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    couponMilestoneCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    coupons: {
      type: [couponSchema],
      default: [],
    },

    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Vendor-only fields
    businessName: {
      type: String,
      default: "",
      trim: true,
    },

    businessDescription: {
      type: String,
      default: "",
      trim: true,
    },

    businessAddress: {
      type: String,
      default: "",
      trim: true,
    },

    businessPhone: {
      type: String,
      default: "",
      trim: true,
    },

    vendorStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    vendorRejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);