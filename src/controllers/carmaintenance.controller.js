import { CarMaintenance } from "../models/carmaintenance.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create a new car maintenance record
 * POST /api/v1/car-maintenance
 */
const createMaintenanceRecord = asyncHandler(async (req, res) => {
  const {
    carRegistrationNumber,
    ownerWhatsAppNumber,
    lastServiceDate,
    meterReading,
    serviceCost,
  } = req.body;

  // Validate required fields
  if (
    !carRegistrationNumber ||
    !ownerWhatsAppNumber ||
    !lastServiceDate ||
    !meterReading ||
    !serviceCost
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Calculate next service date (90 days from last service date)
  const lastService = new Date(lastServiceDate);
  const nextService = new Date(lastService);
  nextService.setDate(nextService.getDate() + 90);

  // Create maintenance record
  const maintenanceRecord = await CarMaintenance.create({
    carRegistrationNumber: carRegistrationNumber.toUpperCase(),
    ownerWhatsAppNumber,
    lastServiceDate: lastService,
    meterReading: Number(meterReading),
    serviceCost: Number(serviceCost),
    nextServiceDate: nextService,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, maintenanceRecord, "Maintenance record created successfully")
    );
});

/**
 * Get recent maintenance records
 * GET /api/v1/car-maintenance/recent?limit=10
 */
const getRecentRecords = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const records = await CarMaintenance.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, records, "Recent maintenance records fetched successfully")
    );
});

/**
 * Get all maintenance records
 * GET /api/v1/car-maintenance
 */
const getAllRecords = asyncHandler(async (req, res) => {
  const records = await CarMaintenance.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, records, "All maintenance records fetched successfully")
    );
});

/**
 * Get a single maintenance record by ID
 * GET /api/v1/car-maintenance/:id
 */
const getRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const record = await CarMaintenance.findById(id);

  if (!record) {
    throw new ApiError(404, "Maintenance record not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, record, "Maintenance record fetched successfully")
    );
});

export {
  createMaintenanceRecord,
  getRecentRecords,
  getAllRecords,
  getRecordById,
};
