const { body, query, validationResult } = require("express-validator");

const PAYMENT_METHODS = ["CASH", "MPESA", "TIGOPESA", "AIRTEL_MONEY", "HALOPESA", "BANK", "CREDIT"];
const ORDER_STATUSES = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const SUMMARY_PERIODS = ["today", "week", "month", "all"];

function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    error: result.array()[0].msg,
    details: result.array().map((item) => ({ field: item.path, message: item.msg })),
  });
}

const productCreateValidation = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("sku").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("SKU must be 100 characters or less"),
  body("unit").optional({ values: "falsy" }).trim().isLength({ max: 30 }).withMessage("Unit must be 30 characters or less"),
  body("buyingPrice").notEmpty().withMessage("Buying price is required").bail().isFloat({ min: 0 }).withMessage("Buying price must be 0 or greater"),
  body("sellingPrice").notEmpty().withMessage("Selling price is required").bail().isFloat({ min: 0 }).withMessage("Selling price must be 0 or greater"),
  body("currentStock").optional().isFloat({ min: 0 }).withMessage("Current stock must be 0 or greater"),
  body("minimumStock").optional().isFloat({ min: 0 }).withMessage("Minimum stock must be 0 or greater"),
  body("supplierId").optional({ values: "falsy" }).isString().withMessage("Supplier ID must be a string"),
  body("doesNotExpire").optional().isBoolean().withMessage("doesNotExpire must be true or false"),
  body("expiryDate").optional({ values: "falsy" }).isISO8601().withMessage("Expiry date must be a valid date"),
  handleValidationErrors,
];

const productUpdateValidation = [
  body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty"),
  body("sku").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("SKU must be 100 characters or less"),
  body("unit").optional({ values: "falsy" }).trim().isLength({ max: 30 }).withMessage("Unit must be 30 characters or less"),
  body("buyingPrice").optional().isFloat({ min: 0 }).withMessage("Buying price must be 0 or greater"),
  body("sellingPrice").optional().isFloat({ min: 0 }).withMessage("Selling price must be 0 or greater"),
  body("minimumStock").optional().isFloat({ min: 0 }).withMessage("Minimum stock must be 0 or greater"),
  body("supplierId").optional({ nullable: true }).isString().withMessage("Supplier ID must be a string"),
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
  body("doesNotExpire").optional().isBoolean().withMessage("doesNotExpire must be true or false"),
  body("expiryDate").optional({ nullable: true, values: "falsy" }).isISO8601().withMessage("Expiry date must be a valid date"),
  handleValidationErrors,
];

const saleListValidation = [
  query("from").optional().isISO8601().withMessage("from must be a valid date"),
  query("to").optional().isISO8601().withMessage("to must be a valid date"),
  query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("limit must be between 1 and 200"),
  query("offset").optional().isInt({ min: 0 }).withMessage("offset must be 0 or greater"),
  handleValidationErrors,
];

const saleSummaryValidation = [
  query("period").optional().isIn(SUMMARY_PERIODS).withMessage("period must be today, week, month, or all"),
  handleValidationErrors,
];

const saleCreateValidation = [
  body("items").isArray({ min: 1 }).withMessage("Sale must have at least one item"),
  body("items.*.productId").isString().notEmpty().withMessage("Each sale item must include a productId"),
  body("items.*.quantity").isFloat({ min: 0.000001 }).withMessage("Each sale item quantity must be greater than 0"),
  body("items.*.unitPrice").optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("Each sale item unitPrice must be 0 or greater"),
  body("paymentMethod").optional().custom((value) => PAYMENT_METHODS.includes(String(value).toUpperCase())).withMessage("Invalid payment method"),
  body("paymentRef").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("Payment reference must be 100 characters or less"),
  body("customerPhone").optional({ values: "falsy" }).trim().isLength({ max: 30 }).withMessage("Customer phone must be 30 characters or less"),
  body("note").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Note must be 500 characters or less"),
  handleValidationErrors,
];

const orderListValidation = [
  query("status").optional().custom((value) => ORDER_STATUSES.includes(String(value).toUpperCase())).withMessage("Invalid order status"),
  handleValidationErrors,
];

const orderCreateValidation = [
  body("supplierId").isString().notEmpty().withMessage("supplierId is required"),
  body("items").isArray({ min: 1 }).withMessage("Order must include at least one item"),
  body("items.*.productId").isString().notEmpty().withMessage("Each order item must include a productId"),
  body("items.*.quantity").isFloat({ min: 0.000001 }).withMessage("Each order item quantity must be greater than 0"),
  body("items.*.unitPrice").optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("Each order item unitPrice must be 0 or greater"),
  body("note").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Note must be 500 characters or less"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  productCreateValidation,
  productUpdateValidation,
  saleListValidation,
  saleSummaryValidation,
  saleCreateValidation,
  orderListValidation,
  orderCreateValidation,
};
