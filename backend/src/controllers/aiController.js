const Order = require("../models/Order");
const Feedback = require("../models/Feedback");
const MenuItem = require("../models/MenuItem");

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    return {
      success: false,
      text: "",
      error: "GEMINI_API_KEY is missing",
      model,
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return {
        success: false,
        text: "",
        error: errorText,
        model,
      };
    }

    const data = await response.json();

    return {
      success: true,
      text:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I could not generate a response right now.",
      error: null,
      model,
    };
  } catch (error) {
    return {
      success: false,
      text: "",
      error: error.message,
      model,
    };
  }
};

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
  const statusMap = {};

  orders.forEach((order) => {
    statusMap[order.status] = (statusMap[order.status] || 0) + 1;

    order.orderItems.forEach((item) => {
      if (item.vendor.toString() !== vendorId.toString()) {
        return;
      }

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
      sentiments: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
    };

    feedbackMap[itemId].ratings.push(f.rating);

    if (feedbackMap[itemId].sentiments[f.sentiment] !== undefined) {
      feedbackMap[itemId].sentiments[f.sentiment] += 1;
    }

    if (f.comment) {
      feedbackMap[itemId].comments.push(f.comment);
    }
  });

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalQuantitySold,
    statusSummary: statusMap,
    itemSales: Object.values(itemMap).sort((a, b) => b.totalQty - a.totalQty),
    categorySales: categoryMap,
    feedbackSummary: feedbackMap,
  };
};

const getVendorAiAnalysis = async (req, res) => {
  try {
    const analyticsData = await buildVendorAnalyticsData(req.user._id);

    const prompt = `
You are a professional restaurant business consultant.

Analyze this vendor's sales, orders, menu category performance, and customer feedback.

Data:
${JSON.stringify(analyticsData, null, 2)}

Please answer in English only.

Give a practical business analysis with:
1. Most popular items
2. Weak items or risks
3. Best-performing dietary categories
4. Feedback-based customer satisfaction insights
5. Menu improvement suggestions
6. Pricing or promotion suggestions
7. Operational advice for delivery and customer experience

Do not invent data. Only use the data provided.
Use clear bullet points.
`;

    const geminiResult = await callGemini(prompt);

    if (!geminiResult.success) {
      return res.json({
        aiProvider: "fallback",
        aiSuccess: false,
        aiError: geminiResult.error,
        model: geminiResult.model,
        analyticsData,
        aiAnalysis:
          "Gemini analysis is not available right now. Please check GEMINI_API_KEY and GEMINI_MODEL in your backend .env file.",
      });
    }

    return res.json({
      aiProvider: "gemini",
      aiSuccess: true,
      aiError: null,
      model: geminiResult.model,
      analyticsData,
      aiAnalysis: geminiResult.text,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLive2dPackageSuggestion = async (req, res) => {
  try {
    const now = new Date();

    const userQuery = String(req.query.query || "").trim();

    const approvedPackages = await MenuItem.find({
      approvalStatus: "approved",
      isAvailable: true,
      itemType: "package",
    })
      .populate("vendor", "businessName name")
      .sort({ totalSold: -1, averageRating: -1 })
      .limit(20);

    const approvedSingles = await MenuItem.find({
      approvalStatus: "approved",
      isAvailable: true,
      itemType: "single",
    })
      .populate("vendor", "businessName name")
      .sort({ totalSold: -1, averageRating: -1 })
      .limit(30);

    const menuData = {
      packages: approvedPackages.map((item) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        dietaryCategory: item.dietaryCategory,
        description: item.description,
        vendor: item.vendor?.businessName || item.vendor?.name || "Unknown vendor",
        totalSold: item.totalSold,
        averageRating: item.averageRating,
        packageItems: item.packageItems,
      })),
      singles: approvedSingles.map((item) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        dietaryCategory: item.dietaryCategory,
        description: item.description,
        vendor: item.vendor?.businessName || item.vendor?.name || "Unknown vendor",
        totalSold: item.totalSold,
        averageRating: item.averageRating,
      })),
    };

    const prompt = `
You are a cute but useful Live2D anime ordering assistant on a campus coffee and catering website.

Current date and time:
${now.toLocaleString()}

The user's request:
"${userQuery || "The user did not type a specific request."}"

Available menu data:
${JSON.stringify(menuData, null, 2)}

Rules:
- Answer in English only.
- Focus on the user's request first.
- Recommend 1 to 3 suitable menu items or packages from the available menu data.
- If the user asks for something unavailable, politely say it is unavailable and suggest the closest available option.
- Do not invent menu items that are not in the data.
- Mention item names and prices.
- Briefly explain why each suggestion matches the user's request and current time.
- Keep the answer under 140 words.
- Avoid unrelated greetings like "Ohayo" or comments about studying unless the user specifically asks.
`;

    const geminiResult = await callGemini(prompt);

    if (geminiResult.success) {
      return res.json({
        currentTime: now.toISOString(),
        suggestion: geminiResult.text,
        aiProvider: "gemini",
        aiSuccess: true,
        aiError: null,
        model: geminiResult.model,
        userQuery,
        menuCount: {
          packages: approvedPackages.length,
          singles: approvedSingles.length,
        },
      });
    }

    const fallbackItems =
      approvedPackages.length > 0 ? approvedPackages : approvedSingles;

    let fallbackSuggestion = "";

    if (fallbackItems.length === 0) {
      fallbackSuggestion =
        "There are no approved menu items available right now. Please check again later.";
    } else if (userQuery) {
      fallbackSuggestion = `I could not reach Gemini right now, but based on your request "${userQuery}", you may consider ${fallbackItems
        .slice(0, 3)
        .map((item) => `${item.name} ($${Number(item.price).toFixed(2)})`)
        .join(", ")}.`;
    } else {
      fallbackSuggestion = `I could not reach Gemini right now, but I recommend ${fallbackItems
        .slice(0, 3)
        .map((item) => `${item.name} ($${Number(item.price).toFixed(2)})`)
        .join(", ")}.`;
    }

    return res.json({
      currentTime: now.toISOString(),
      suggestion: fallbackSuggestion,
      aiProvider: "fallback",
      aiSuccess: false,
      aiError: geminiResult.error,
      model: geminiResult.model,
      userQuery,
      menuCount: {
        packages: approvedPackages.length,
        singles: approvedSingles.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVendorAiAnalysis,
  getLive2dPackageSuggestion,
};