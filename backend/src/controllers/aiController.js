const Order = require("../models/Order");
const Feedback = require("../models/Feedback");
const MenuItem = require("../models/MenuItem");

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  console.log("========== GEMINI CALL ==========");
  console.log("Model:", model);
  console.log("API key exists:", Boolean(apiKey));
  console.log("Prompt length:", prompt.length);

  if (!apiKey) {
    return {
      success: false,
      text: "",
      error: "GEMINI_API_KEY is missing",
      model,
      status: null,
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 700,
        },
      }),
    });

    const rawText = await response.text();

    console.log("Gemini status:", response.status);
    console.log("Gemini raw response:", rawText.slice(0, 1000));
    console.log("=================================");

    if (!response.ok) {
      return {
        success: false,
        text: "",
        error: rawText,
        model,
        status: response.status,
      };
    }

    const data = JSON.parse(rawText);

    return {
      success: true,
      text:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Gemini returned no text.",
      error: null,
      model,
      status: response.status,
    };
  } catch (error) {
    console.error("Gemini fetch failed:", error);
    console.log("=================================");

    return {
      success: false,
      text: "",
      error: error.message,
      model,
      status: null,
    };
  }
};

const buildVendorAnalyticsData = async (vendorId) => {
  const orders = await Order.find({
    "orderItems.vendor": vendorId,
    status: { $ne: "cancelled" },
  }).populate("orderItems.menuItem", "name category dietaryCategory itemType image");

  const feedback = await Feedback.find({
    vendor: vendorId,
  }).populate("menuItem", "name category dietaryCategory itemType image");

  let totalRevenue = 0;
  let totalQuantitySold = 0;

  const itemMap = {};
  const categoryMap = {};
  const feedbackMap = {};
  const statusMap = {};

  orders.forEach((order) => {
    const orderStatus = order.status || "unknown";
    statusMap[orderStatus] = (statusMap[orderStatus] || 0) + 1;

    order.orderItems.forEach((item) => {
      if (!item.vendor) {
        return;
      }

      if (item.vendor.toString() !== vendorId.toString()) {
        return;
      }

      const itemId =
        item.menuItem?._id?.toString() ||
        item.menuItem?.toString() ||
        "unknown-item";

      const itemName =
        item.name ||
        item.menuItem?.name ||
        "Unknown item";

      const itemCategory =
        item.menuItem?.category ||
        item.category ||
        "unknown";

      const dietaryCategory =
        item.dietaryCategory ||
        item.menuItem?.dietaryCategory ||
        "unknown";

      const itemType =
        item.itemType ||
        item.menuItem?.itemType ||
        "single";

      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);

      if (!itemMap[itemId]) {
        itemMap[itemId] = {
          menuItem: itemId,
          name: itemName,
          category: itemCategory,
          dietaryCategory,
          itemType,
          totalQty: 0,
          totalRevenue: 0,
        };
      }

      itemMap[itemId].totalQty += qty;
      itemMap[itemId].totalRevenue += qty * price;

      if (!categoryMap[dietaryCategory]) {
        categoryMap[dietaryCategory] = {
          totalQty: 0,
          totalRevenue: 0,
        };
      }

      categoryMap[dietaryCategory].totalQty += qty;
      categoryMap[dietaryCategory].totalRevenue += qty * price;

      totalQuantitySold += qty;
      totalRevenue += qty * price;
    });
  });

  feedback.forEach((f) => {
    if (!f.menuItem) {
      return;
    }

    const itemId =
      f.menuItem?._id?.toString() ||
      f.menuItem?.toString() ||
      "unknown-feedback-item";

    if (!feedbackMap[itemId]) {
      feedbackMap[itemId] = {
        itemName: f.menuItem?.name || "Unknown item",
        ratings: [],
        comments: [],
        sentiments: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
      };
    }

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

Do not invent data.
Only use the data provided.
Use clear bullet points.
`;

    const geminiResult = await callGemini(prompt);

    if (!geminiResult.success) {
      return res.json({
        aiProvider: "fallback",
        aiSuccess: false,
        aiError: geminiResult.error,
        model: geminiResult.model,
        status: geminiResult.status,
        analyticsData,
        aiAnalysis:
          "Gemini business analysis is currently unavailable. Please check GEMINI_API_KEY, GEMINI_MODEL, and the backend console output.",
      });
    }

    return res.json({
      aiProvider: "gemini",
      aiSuccess: true,
      aiError: null,
      model: geminiResult.model,
      status: geminiResult.status,
      analyticsData,
      aiAnalysis: geminiResult.text,
    });
  } catch (error) {
    console.error("========== VENDOR AI ANALYSIS ERROR ==========");
    console.error(error);
    console.error("=============================================");
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
        vendor:
          item.vendor?.businessName ||
          item.vendor?.name ||
          "Unknown vendor",
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
        vendor:
          item.vendor?.businessName ||
          item.vendor?.name ||
          "Unknown vendor",
        totalSold: item.totalSold,
        averageRating: item.averageRating,
      })),
    };

    const prompt = `
You are an ordering assistant for a campus coffee and catering website.

Current date and time:
${now.toLocaleString()}

User request:
"${userQuery || "No specific request"}"

Available menu data:
${JSON.stringify(menuData, null, 2)}

Answer in English only.

Rules:
1. Only recommend items that appear in the available menu data.
2. Focus only on food, drink, or catering recommendation.
3. Do not greet the user.
4. Do not mention studying, anime, school life, or unrelated comments.
5. If the user asks for something unavailable, say it is unavailable and suggest the closest available item.
6. Recommend 1 to 3 items or packages.
7. Mention item name, price, and one short reason.
8. Keep the answer under 120 words.
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
        status: geminiResult.status,
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
      fallbackSuggestion = `Gemini is currently unavailable. Based on your request "${userQuery}", you may consider ${fallbackItems
        .slice(0, 3)
        .map((item) => `${item.name} ($${Number(item.price).toFixed(2)})`)
        .join(", ")}.`;
    } else {
      fallbackSuggestion = `Gemini is currently unavailable. You may consider ${fallbackItems
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
      status: geminiResult.status,
      userQuery,
      menuCount: {
        packages: approvedPackages.length,
        singles: approvedSingles.length,
      },
    });
  } catch (error) {
    console.error("========== LIVE2D PACKAGE SUGGESTION ERROR ==========");
    console.error(error);
    console.error("====================================================");
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVendorAiAnalysis,
  getLive2dPackageSuggestion,
};