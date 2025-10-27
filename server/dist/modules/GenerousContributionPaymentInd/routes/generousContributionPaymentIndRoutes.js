"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/modules/GenerousContributionPaymentInd/routes/generousContributionPaymentIndRoutes.ts
const express_1 = __importDefault(require("express"));
const GenerousContributionPaymentIndController_1 = __importDefault(require("../controllers/GenerousContributionPaymentIndController"));
const authorizeUser_1 = __importDefault(require("../../../middlewares/authorizeUser"));
const authenticateUser_1 = require("../../authentication/middlewares/authenticateUser");
const paymentCreateDoc_1 = require("../docs/paymentCreateDoc");
const paymentCreateValidator_1 = require("../validators/paymentCreateValidator");
const generatePdf_1 = require("../../../services/generatePdf");
const router = express_1.default.Router();
const controller = new GenerousContributionPaymentIndController_1.default();
router.post("/create", paymentCreateDoc_1.paymentCreateDoc, paymentCreateValidator_1.paymentCreateValidator, controller.createPayment);
router.get("/public/:id", controller.getPaymentById);
router.post("/verify", controller.verifyPayment);
router.get("/payment-success", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Example input (replace with actual values from payment)
    const { phoneNo = "918848196653" } = req.query;
    const paymentDetails = {
        name: "Well Wisher",
        amount: 3000,
        phoneNo,
        address: 'Sample Address, City, State, India - 680121',
        date: "20 Dec 2024",
        transactionNumber: "9496277968",
        receiptNumber: "GCI00-20598",
    };
    (0, generatePdf_1.generateReceiptPDF)(res, paymentDetails);
}));
router.post("/", controller.getPayments);
router.use(authenticateUser_1.authenticateUser);
// Common authorization
const authorization = (0, authorizeUser_1.default)({ allowedRoles: [] });
router.get("/", controller.get);
router.get("/stats", controller.getPaymentStats1);
/**
 * @route   GET /api/generous-payments-ind/stats
 * @desc    Get payment statistics
 * @access  Private (Admin/Staff)
 */
/**
 * @route   GET /api/generous-payments-ind/:id
 * @desc    Get payment by ID (full details)
 * @access  Private (Admin/Staff)
 */
router.get("/:id", authorization, controller.getPaymentById);
/**
 * @route   PUT /api/generous-payments-ind/:id
 * @desc    Update payment details
 * @access  Private (Admin/Staff)
 */
router.put("/:id", authorization, controller.updatePayment);
/**
 * @route   DELETE /api/generous-payments-ind/:id
 * @desc    Delete payment record
 * @access  Private (Admin only)
 */
router.delete("/:id", authorization, controller.deletePayment);
/**
 * @route   POST /api/generous-payments-ind/manual
 * @desc    Create manual/offline payment record
 * @access  Private (Admin/Staff)
 */
router.post("/manual", authorization, controller.createManualPayment);
/**
 * @route   POST /api/generous-payments-ind/:id/refund
 * @desc    Process payment refund
 * @access  Private (Admin only)
 */
router.post("/:id/refund", authorization, controller.refundPayment);
exports.default = router;
