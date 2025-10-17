// server/src/modules/BedPaymentIn/routes/BedPaymentInd.ts
import express from "express";
import BedPaymentIndController from "../controllers/BedPaymentInd";
import authorizeUser from "../../../middlewares/authorizeUser";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import { paymentCreateDoc } from "../docs/paymentCreateDoc";
import { paymentCreateValidator } from "../validators/paymentCreateValidator";
import { generateReceiptPDFIndia } from "../../../services/generatePdfIndia";
import { paymentListDoc } from "../docs/paymentListDoc";
import setFilterParams from "../../../middlewares/setFilterParams";
import { BedPaymentIndFilterFields } from "../models/BedPaymentIn";

const router = express.Router();
const controller: any = new BedPaymentIndController();

// Public routes (no authentication required)

/**
 * @route   POST /api/bed-payments-ind/create-order
 * @desc    Create Razorpay order for payment
 * @access  Public
 */
router.post(
  "/create-order",
  paymentListDoc,
  controller.createOrder
);

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
router.get("/get-supporter-data/:id", paymentListDoc, controller.getSupporterDetails);

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
router.get("/payment-success", async (req, res) => {
  const { phoneNo = "918848196653" } = req.query;

  const paymentDetails: any = {
    name: "Well Wisher",
    amount: 3000,
    phoneNo,
    address: 'Alukkaparambil House, Karukulangara, \n' +
      'Irinjalakuda, Thrissur, Kerala-680121',
    date: "20 Dec 2024",
    transactionNumber: "9496277968",
    receiptNumber: "BEDIND-2024-00001",
  };

  generateReceiptPDFIndia(res, paymentDetails);
});

/**
 * @route   POST /api/bed-payments-ind/
 * @desc    Get payments with filters (POST for complex queries)
 * @access  Public
 */
router.post("/", controller.getPayments);

// Authentication required for all routes below
router.use(authenticateUser);

// Common authorization (accessible by all authenticated users)
const authorization = authorizeUser({ allowedRoles: [] });

/**
 * @route   GET /api/bed-payments-ind/
 * @desc    Get all payments with filtering and pagination
 * @access  Private (Admin/Staff)
 */
router.get(
  "/",
  paymentListDoc,
  setFilterParams(BedPaymentIndFilterFields),
  controller.get
);

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

export default router;
