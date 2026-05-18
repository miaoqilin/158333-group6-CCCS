const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    itemType: {
      type: String,
      enum: ["single", "package"],
      default: "single",
    },

    dietaryCategory: {
      type: String,
      enum: ["meat", "vegetarian", "vegan", "gluten_free"],
      required: true,
    },

    packageItems: {
      type: [
        {
          name: String,
          quantity: Number,
          description: String,
        },
      ],
      default: [],
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    specialInstructions: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    emailSent: {
      type: Boolean,
      default: false,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    emailMessage: {
      type: String,
      default: "",
    },
    smsMessage: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    subtotalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    usedCoupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },

    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "campus_account", "mobile_wallet"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "paid",
    },

    status: {
      type: String,
      enum: ["paid", "preparing", "out_for_delivery", "delivered", "completed", "cancelled"],
      default: "paid",
    },

    deliveryTime: {
      type: String,
      required: [true, "Delivery time is required"],
    },

    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },

    note: {
      type: String,
      default: "",
    },

    notification: {
      type: notificationSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);