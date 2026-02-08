import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getSalesAnalytics,
  getMonthlyAnalytics,
} from "../controllers/transaction.controller.js";

const router = Router();

// Rate limiter for transaction endpoints
// Allows 150 requests per 15 minutes per IP
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all routes
router.use(transactionLimiter);

// Get sales analytics
router.get("/analytics/sales", getSalesAnalytics);

// Get monthly sales vs purchases analytics
router.get("/analytics/monthly", getMonthlyAnalytics);

// Create a new transaction
router.post("/", createTransaction);

// Get all transactions with pagination and filters
router.get("/", getAllTransactions);

// Get a single transaction by ID
router.get("/:id", getTransactionById);

export default router;
