import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create a new product
 * POST /api/v1/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    category,
    price,
    purchasePrice,
    stockQuantity,
    compatibility,
    description,
  } = req.body;

  // Validate required fields
  if (!name || !sku || !category || price === undefined || purchasePrice === undefined) {
    throw new ApiError(400, "Name, SKU, category, price, and purchase price are required");
  }

  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
  if (existingProduct) {
    throw new ApiError(409, "Product with this SKU already exists");
  }

  // Create product
  const product = await Product.create({
    name,
    sku: sku.toUpperCase(),
    category,
    price: Number(price),
    purchasePrice: Number(purchasePrice),
    stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
    compatibility: compatibility || [],
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

/**
 * Get all products
 * GET /api/v1/products?category=&search=&page=1&limit=50
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 50 } = req.query;
  
  const filter = {};
  
  // Filter by category
  if (category) {
    filter.category = category;
  }
  
  // Search by name or description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Products fetched successfully"
    )
  );
});

/**
 * Get a single product by ID
 * GET /api/v1/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

/**
 * Update a product
 * PUT /api/v1/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  // If SKU is being updated, check for duplicates
  if (updateData.sku) {
    const existingProduct = await Product.findOne({
      sku: updateData.sku.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingProduct) {
      throw new ApiError(409, "Product with this SKU already exists");
    }
    updateData.sku = updateData.sku.toUpperCase();
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

/**
 * Delete a product
 * DELETE /api/v1/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

/**
 * Get low stock products (quantity < 10)
 * GET /api/v1/products/low-stock
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;

  const products = await Product.find({
    stockQuantity: { $lt: threshold },
  }).sort({ stockQuantity: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, products, "Low stock products fetched successfully")
    );
});

/**
 * Get product categories
 * GET /api/v1/products/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

/**
 * Update stock quantity
 * PATCH /api/v1/products/:id/stock
 */
const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, operation } = req.body;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  if (!quantity || !operation) {
    throw new ApiError(400, "Quantity and operation are required");
  }

  if (!["add", "subtract", "set"].includes(operation)) {
    throw new ApiError(400, "Operation must be 'add', 'subtract', or 'set'");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let newQuantity;
  switch (operation) {
    case "add":
      newQuantity = product.stockQuantity + Number(quantity);
      break;
    case "subtract":
      newQuantity = product.stockQuantity - Number(quantity);
      if (newQuantity < 0) {
        throw new ApiError(400, "Stock quantity cannot be negative");
      }
      break;
    case "set":
      newQuantity = Number(quantity);
      break;
  }

  product.stockQuantity = newQuantity;
  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Stock quantity updated successfully"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories,
  updateStock,
};
