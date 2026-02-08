import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories,
  updateStock,
} from "../controllers/product.controller.js";

const router = Router();

// Rate limiter for product endpoints
// Allows 200 requests per 15 minutes per IP
const productLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all routes
router.use(productLimiter);

// Get product categories
router.get("/categories", getCategories);

// Get low stock products
router.get("/low-stock", getLowStockProducts);

// Create a new product
router.post("/", createProduct);

// Get all products with pagination and filters
router.get("/", getAllProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Update a product
router.put("/:id", updateProduct);

// Update stock quantity
router.patch("/:id/stock", updateStock);

// Delete a product
router.delete("/:id", deleteProduct);

export default router;
