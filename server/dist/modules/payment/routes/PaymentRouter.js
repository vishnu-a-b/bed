"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUser_1 = require("../../authentication/middlewares/authenticateUser");
const authorizeUser_1 = __importDefault(require("../../../middlewares/authorizeUser"));
const setFilterParams_1 = __importDefault(require("../../../middlewares/setFilterParams"));
const Payment_1 = __importDefault(require("../controllers/Payment"));
const Payment_2 = require("../models/Payment"); // you'll define this like supporterFilterFields
// Swagger docs (optional if you’re using Swagger/OpenAPI)
const paymentListDoc_1 = require("../docs/paymentListDoc");
const paymentCreateDoc_1 = require("../docs/paymentCreateDoc");
const paymentDetailsDoc_1 = require("../docs/paymentDetailsDoc");
const paymentCountDoc_1 = require("../docs/paymentCountDoc");
const paymentDeleteDoc_1 = require("../docs/paymentDeleteDoc");
const paymentUpdateDoc_1 = require("../docs/paymentUpdateDoc");
// Validators (optional)
const paymentCreateValidator_1 = require("../validators/paymentCreateValidator");
const paymentUpdateValidator_1 = require("../validators/paymentUpdateValidator");
const router = express_1.default.Router();
const controller = new Payment_1.default();
// Public Routes (if needed)
router.post("/", paymentCreateDoc_1.paymentCreateDoc, paymentCreateValidator_1.paymentCreateValidator, controller.create);
router.get("/get-supporter-data/:id", paymentListDoc_1.paymentListDoc, controller.getSupporterDetails);
router.post("/create-order", paymentListDoc_1.paymentListDoc, controller.createOrder);
// Verify payment
router.post("/verify", controller.verifyPayment);
// Authentication required for all other routes
router.use(authenticateUser_1.authenticateUser);
// Common authorization
const authorization = (0, authorizeUser_1.default)({ allowedRoles: [] });
router.get("/", paymentListDoc_1.paymentListDoc, (0, setFilterParams_1.default)(Payment_2.paymentFilterFields), controller.get);
router.get("/count-documents", paymentCountDoc_1.paymentCountDoc, controller.countTotalDocuments);
router.get("/:id", paymentDetailsDoc_1.paymentDetailsDoc, controller.getOne);
router.put("/:id", paymentUpdateDoc_1.paymentUpdateDoc, paymentUpdateValidator_1.paymentUpdateValidator, controller.update);
router.delete("/:id", paymentDeleteDoc_1.paymentDeleteDoc, authorization, controller.delete);
exports.default = router;
