import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getAllLedgerEntries,
  getLedgerEntryById,
  getCurrentBalance,
  getLedgerSummary,
  exportLedgerToCSV,
} from "../controllers/ledger.controller.js";

const router = Router();

// Rate limiter for ledger endpoints
// Allows 150 requests per 15 minutes per IP
const ledgerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all routes
router.use(ledgerLimiter);

// Get current balance
router.get("/balance", getCurrentBalance);

// Get ledger summary
router.get("/summary", getLedgerSummary);

// Export ledger to CSV
router.get("/export", exportLedgerToCSV);

// Get all ledger entries with pagination and filters
router.get("/", getAllLedgerEntries);

// Get a single ledger entry by ID
router.get("/:id", getLedgerEntryById);

export default router;
