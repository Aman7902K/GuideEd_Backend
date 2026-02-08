import { Transaction } from "../models/transaction.model.js";
import { Product } from "../models/product.model.js";
import { Ledger } from "../models/ledger.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create a new transaction (Sale or Purchase)
 * POST /api/v1/transactions
 */
const createTransaction = asyncHandler(async (req, res) => {
  const {
    type,
    items,
    discount,
    paymentMethod,
    customerName,
    customerPhone,
    supplierName,
    notes,
  } = req.body;

  // Validate required fields
  if (!type || !items || !paymentMethod) {
    throw new ApiError(400, "Type, items, and payment method are required");
  }

  if (!["Sale", "Purchase"].includes(type)) {
    throw new ApiError(400, "Type must be 'Sale' or 'Purchase'");
  }

  if (!items || items.length === 0) {
    throw new ApiError(400, "At least one item is required");
  }

  // Process items and calculate totals
  const processedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ApiError(404, `Product with ID ${item.product} not found`);
    }

    // For sales, check if sufficient stock is available
    if (type === "Sale" && product.stockQuantity < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
      );
    }

    const unitPrice = type === "Sale" ? product.price : product.purchasePrice;
    const totalPrice = unitPrice * item.quantity;

    processedItems.push({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });

    totalAmount += totalPrice;

    // Update product stock
    if (type === "Sale") {
      product.stockQuantity -= item.quantity;
    } else {
      product.stockQuantity += item.quantity;
    }
    await product.save();
  }

  // Calculate final amount after discount
  const discountAmount = discount || 0;
  const finalAmount = totalAmount - discountAmount;

  if (finalAmount < 0) {
    throw new ApiError(400, "Final amount cannot be negative");
  }

  // Create transaction
  const transaction = await Transaction.create({
    type,
    items: processedItems,
    totalAmount,
    discount: discountAmount,
    finalAmount,
    paymentMethod,
    customerName,
    customerPhone,
    supplierName,
    notes,
  });

  // Calculate running balance for ledger
  const lastLedgerEntry = await Ledger.findOne().sort({ createdAt: -1 });
  const previousBalance = lastLedgerEntry ? lastLedgerEntry.balance : 0;
  
  // Sales increase balance, purchases decrease balance
  const newBalance = type === "Sale" 
    ? previousBalance + finalAmount 
    : previousBalance - finalAmount;

  // Create ledger entry
  await Ledger.create({
    transaction: transaction._id,
    transactionType: type,
    amount: finalAmount,
    balance: newBalance,
    entityType: type === "Sale" ? "Customer" : "Supplier",
    entityName: type === "Sale" ? customerName || "Walk-in Customer" : supplierName || "Unknown Supplier",
    description: `${type} transaction - ${processedItems.length} item(s)`,
  });

  // Populate the transaction with product details
  const populatedTransaction = await Transaction.findById(transaction._id).populate(
    "items.product"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedTransaction, "Transaction created successfully")
    );
});

/**
 * Get all transactions
 * GET /api/v1/transactions?type=&page=1&limit=50&startDate=&endDate=
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 50, startDate, endDate } = req.query;

  const filter = {};

  // Filter by type
  if (type && ["Sale", "Purchase"].includes(type)) {
    filter.type = type;
  }

  // Filter by date range
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("items.product");

  const total = await Transaction.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Transactions fetched successfully"
    )
  );
});

/**
 * Get a single transaction by ID
 * GET /api/v1/transactions/:id
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid transaction ID format");
  }

  const transaction = await Transaction.findById(id).populate("items.product");

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transaction fetched successfully"));
});

/**
 * Get sales analytics
 * GET /api/v1/transactions/analytics/sales
 */
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = { type: "Sale" };
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const analytics = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$finalAmount" },
        totalTransactions: { $sum: 1 },
        totalDiscount: { $sum: "$discount" },
        avgTransactionValue: { $avg: "$finalAmount" },
      },
    },
  ]);

  const result = analytics[0] || {
    totalRevenue: 0,
    totalTransactions: 0,
    totalDiscount: 0,
    avgTransactionValue: 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Sales analytics fetched successfully"));
});

/**
 * Get monthly sales vs purchases
 * GET /api/v1/transactions/analytics/monthly
 */
const getMonthlyAnalytics = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  const analytics = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          type: "$type",
        },
        total: { $sum: "$finalAmount" },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // Format the data for recharts
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i).toLocaleString("default", { month: "short" }),
    Sales: 0,
    Purchases: 0,
  }));

  analytics.forEach((item) => {
    const monthIndex = item._id.month - 1;
    monthlyData[monthIndex][item._id.type === "Sale" ? "Sales" : "Purchases"] =
      item.total;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, monthlyData, "Monthly analytics fetched successfully")
    );
});

export {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getSalesAnalytics,
  getMonthlyAnalytics,
};
