const Order = require("../models/Order");
const Feedback = require("../models/Feedback");

const buildVendorAnalyticsData = async (vendorId) => {
  const orders = await Order.find({
    "orderItems.vendor": vendorId,
    status: { $ne: "cancelled" },
  }).populate("orderItems.menuItem", "name category dietaryCategory itemType");

  const feedback = await Feedback.find({
    vendor: vendorId,
  }).populate("menuItem", "name category dietaryCategory itemType");

  let totalRevenue = 0;
  let totalQuantitySold = 0;

  const itemMap = {};
  const categoryMap = {};
  const feedbackMap = {};

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (item.vendor.toString() !== vendorId.toString()) return;

      const itemId = item.menuItem?._id?.toString() || item.menuItem.toString();

      if (!itemMap[itemId]) {
        itemMap[itemId] = {
          name: item.name,
          category: item.menuItem?.category || "",
          dietaryCategory: item.dietaryCategory,
          itemType: item.itemType,
          totalQty: 0,
          totalRevenue: 0,
        };
      }

      itemMap[itemId].totalQty += item.qty;
      itemMap[itemId].totalRevenue += item.qty * item.price;

      categoryMap[item.dietaryCategory] = categoryMap[item.dietaryCategory] || {
        totalQty: 0,
        totalRevenue: 0,
      };

      categoryMap[item.dietaryCategory].totalQty += item.qty;
      categoryMap[item.dietaryCategory].totalRevenue += item.qty * item.price;

      totalQuantitySold += item.qty;
      totalRevenue += item.qty * item.price;
    });
  });

  feedback.forEach((f) => {
    const itemId = f.menuItem?._id?.toString() || f.menuItem.toString();

    feedbackMap[itemId] = feedbackMap[itemId] || {
      itemName: f.menuItem?.name || "Unknown item",
      ratings: [],
      comments: [],
    };

    feedbackMap[itemId].ratings.push(f.rating);

    if (f.comment) {
      feedbackMap[itemId].comments.push(f.comment);
    }
  });

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalQuantitySold,
    itemSales: Object.values(itemMap).sort((a, b) => b.totalQty - a.totalQty),
    categorySales: categoryMap,
    feedbackSummary: feedbackMap,
  };
};

const getVendorAiAnalysis = async (req, res) => {
  try {
    const analyticsData = await buildVendorAnalyticsData(req.user._id);

    if (!process.env.DEEPSEEK_API_KEY) {
      return res.json({
        message: "DEEPSEEK_API_KEY is not configured. Returning raw analytics data only.",
        analyticsData,
        aiAnalysis: null,
      });
    }

    const prompt = `
You are a professional restaurant business consultant.
Analyze the following vendor sales, order, category and customer feedback data.
Give practical suggestions about:
1. Which items are most popular
2. Which items should be promoted
3. Which categories perform well
4. What customer feedback suggests
5. Pricing and menu improvement ideas
6. Operational advice for delivery time and customer satisfaction

Data:
${JSON.stringify(analyticsData, null, 2)}
`;

    const response = await fetch(process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert restaurant operator and business analyst.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(500).json({
        message: "DeepSeek API request failed",
        error: errorText,
        analyticsData,
      });
    }

    const data = await response.json();

    return res.json({
      analyticsData,
      aiAnalysis: data.choices?.[0]?.message?.content || "",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVendorAiAnalysis,
};