import { Ledger } from "../models/ledger.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all ledger entries
 * GET /api/v1/ledger?page=1&limit=50&entityType=&startDate=&endDate=
 */
const getAllLedgerEntries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, entityType, startDate, endDate } = req.query;

  const filter = {};

  // Filter by entity type
  if (entityType && ["Customer", "Supplier"].includes(entityType)) {
    filter.entityType = entityType;
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

  const entries = await Ledger.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate({
      path: "transaction",
      select: "type finalAmount paymentMethod createdAt",
    });

  const total = await Ledger.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        entries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Ledger entries fetched successfully"
    )
  );
});

/**
 * Get ledger entry by ID
 * GET /api/v1/ledger/:id
 */
const getLedgerEntryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid ledger entry ID format");
  }

  const entry = await Ledger.findById(id).populate({
    path: "transaction",
    populate: {
      path: "items.product",
    },
  });

  if (!entry) {
    throw new ApiError(404, "Ledger entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, entry, "Ledger entry fetched successfully"));
});

/**
 * Get current balance
 * GET /api/v1/ledger/balance
 */
const getCurrentBalance = asyncHandler(async (req, res) => {
  const lastEntry = await Ledger.findOne().sort({ createdAt: -1 });

  const balance = lastEntry ? lastEntry.balance : 0;

  return res
    .status(200)
    .json(new ApiResponse(200, { balance }, "Current balance fetched successfully"));
});

/**
 * Get ledger summary
 * GET /api/v1/ledger/summary?startDate=&endDate=
 */
const getLedgerSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const summary = await Ledger.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$transactionType",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    totalSales: 0,
    totalPurchases: 0,
    salesCount: 0,
    purchasesCount: 0,
  };

  summary.forEach((item) => {
    if (item._id === "Sale") {
      result.totalSales = item.total;
      result.salesCount = item.count;
    } else if (item._id === "Purchase") {
      result.totalPurchases = item.total;
      result.purchasesCount = item.count;
    }
  });

  result.netAmount = result.totalSales - result.totalPurchases;

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Ledger summary fetched successfully"));
});

/**
 * Export ledger to CSV
 * GET /api/v1/ledger/export?startDate=&endDate=
 */
const exportLedgerToCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const entries = await Ledger.find(filter)
    .sort({ createdAt: 1 })
    .populate({
      path: "transaction",
      select: "type finalAmount paymentMethod",
    });

  // Generate CSV content
  const csvHeader = "Date,Type,Entity Type,Entity Name,Amount,Balance,Payment Method,Description\n";
  const csvRows = entries.map((entry) => {
    const date = new Date(entry.createdAt).toLocaleString();
    const type = entry.transactionType;
    const entityType = entry.entityType;
    const entityName = entry.entityName;
    const amount = entry.amount;
    const balance = entry.balance;
    const paymentMethod = entry.transaction?.paymentMethod || "N/A";
    const description = entry.description || "";

    return `"${date}","${type}","${entityType}","${entityName}",${amount},${balance},"${paymentMethod}","${description}"`;
  }).join("\n");

  const csvContent = csvHeader + csvRows;

  // Set headers for CSV download
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=ledger-export-${Date.now()}.csv`
  );

  return res.status(200).send(csvContent);
});

export {
  getAllLedgerEntries,
  getLedgerEntryById,
  getCurrentBalance,
  getLedgerSummary,
  exportLedgerToCSV,
};
