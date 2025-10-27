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
// server/src/modules/BedPaymentIn/routes/BedPaymentInd.ts
const express_1 = __importDefault(require("express"));
const BedPaymentInd_1 = __importDefault(require("../controllers/BedPaymentInd"));
const authorizeUser_1 = __importDefault(require("../../../middlewares/authorizeUser"));
const authenticateUser_1 = require("../../authentication/middlewares/authenticateUser");
const generatePdfIndia_1 = require("../../../services/generatePdfIndia");
const paymentListDoc_1 = require("../docs/paymentListDoc");
const setFilterParams_1 = __importDefault(require("../../../middlewares/setFilterParams"));
const BedPaymentIn_1 = require("../models/BedPaymentIn");
const router = express_1.default.Router();
const controller = new BedPaymentInd_1.default();
// Public routes (no authentication required)
/**
 * @route   POST /api/bed-payments-ind/create-order
 * @desc    Create Razorpay order for payment (Standard Checkout - Deprecated)
 * @access  Public
 */
router.post("/create-order", paymentListDoc_1.paymentListDoc, controller.createOrder);
/**
 * @route   POST /api/bed-payments-ind/create-order-hosted
 * @desc    Create Razorpay order for Hosted/Embedded Checkout (CollectNow Required)
 * @access  Public
 */
router.post("/create-order-hosted", paymentListDoc_1.paymentListDoc, controller.createOrderHosted);
/**
 * @route   POST /api/bed-payments-ind/verify
 * @desc    Verify Razorpay payment signature
 * @access  Public
 */
router.post("/verify", controller.verifyPayment);
/**
 * @route   GET /api/bed-payments-ind/get-supporter-data/:id
 * @desc    Get supporter payment details
 * @access  Public
 */
router.get("/get-supporter-data/:id", paymentListDoc_1.paymentListDoc, controller.getSupporterDetails);
/**
 * @route   POST /api/bed-payments-ind/payment-followup
 * @desc    Send payment reminder to supporter
 * @access  Public
 */
router.post("/payment-followup", controller.sendPaymentReminderController);
/**
 * @route   GET /api/bed-payments-ind/public/:id
 * @desc    Get payment details (public view)
 * @access  Public
 */
router.get("/public/:id", controller.getPaymentById);
/**
 * @route   GET /api/bed-payments-ind/payment-success
 * @desc    Generate and download receipt PDF
 * @access  Public
 */
router.get("/payment-success", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNo = "918848196653" } = req.query;
    const paymentDetails = {
        name: "Well Wisher",
        amount: 3000,
        phoneNo,
        address: 'Alukkaparambil House, Karukulangara, \n' +
            'Irinjalakuda, Thrissur, Kerala-680121',
        date: "20 Dec 2024",
        transactionNumber: "9496277968",
        receiptNumber: "BEDIND-2024-00001",
    };
    (0, generatePdfIndia_1.generateReceiptPDFIndia)(res, paymentDetails);
}));
/**
 * @route   POST /api/bed-payments-ind/
 * @desc    Get payments with filters (POST for complex queries)
 * @access  Public
 */
router.post("/", controller.getPayments);
// Authentication required for all routes below
router.use(authenticateUser_1.authenticateUser);
// Common authorization (accessible by all authenticated users)
const authorization = (0, authorizeUser_1.default)({ allowedRoles: [] });
/**
 * @route   GET /api/bed-payments-ind/
 * @desc    Get all payments with filtering and pagination
 * @access  Private (Admin/Staff)
 */
router.get("/", paymentListDoc_1.paymentListDoc, (0, setFilterParams_1.default)(BedPaymentIn_1.BedPaymentIndFilterFields), controller.get);
/**
 * @route   GET /api/bed-payments-ind/stats
 * @desc    Get payment statistics
 * @access  Private (Admin/Staff)
 */
router.get("/stats", controller.getPaymentStats1);
/**
 * @route   GET /api/bed-payments-ind/:id
 * @desc    Get payment by ID (full details)
 * @access  Private (Admin/Staff)
 */
router.get("/:id", authorization, controller.getPaymentById);
/**
 * @route   PUT /api/bed-payments-ind/:id
 * @desc    Update payment details
 * @access  Private (Admin/Staff)
 */
router.put("/:id", authorization, controller.updatePayment);
/**
 * @route   DELETE /api/bed-payments-ind/:id
 * @desc    Delete payment record
 * @access  Private (Admin only)
 */
router.delete("/:id", authorization, controller.deletePayment);
/**
 * @route   POST /api/bed-payments-ind/manual
 * @desc    Create manual/offline payment record
 * @access  Private (Admin/Staff)
 */
router.post("/manual", authorization, controller.createManualPayment);
/**
 * @route   PATCH /api/bed-payments-ind/:id/approve
 * @desc    Approve or reject manual payment
 * @access  Private (Admin/Staff)
 */
router.patch("/:id/approve", authorization, controller.approveManualPayment);
/**
 * @route   POST /api/bed-payments-ind/:id/refund
 * @desc    Process payment refund
 * @access  Private (Admin only)
 */
router.post("/:id/refund", authorization, controller.refundPayment);
exports.default = router;
