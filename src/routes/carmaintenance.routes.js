import { Router } from "express";
import {
  createMaintenanceRecord,
  getRecentRecords,
  getAllRecords,
  getRecordById,
} from "../controllers/carmaintenance.controller.js";

const router = Router();

// Create a new maintenance record
router.post("/", createMaintenanceRecord);

// Get recent maintenance records
router.get("/recent", getRecentRecords);

// Get all maintenance records
router.get("/", getAllRecords);

// Get a single maintenance record by ID
router.get("/:id", getRecordById);

export default router;
