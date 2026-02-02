import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createMaintenanceRecord,
  getRecentRecords,
  getAllRecords,
  getRecordById,
} from "../controllers/carmaintenance.controller.js";

const router = Router();

// Rate limiter for car maintenance endpoints
// Allows 100 requests per 15 minutes per IP
const carMaintenanceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all routes
router.use(carMaintenanceLimiter);

// Create a new maintenance record
router.post("/", createMaintenanceRecord);

// Get recent maintenance records
router.get("/recent", getRecentRecords);

// Get all maintenance records
router.get("/", getAllRecords);

// Get a single maintenance record by ID
router.get("/:id", getRecordById);

export default router;
