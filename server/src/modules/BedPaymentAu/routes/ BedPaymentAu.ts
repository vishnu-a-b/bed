// server/src/modules/payment/routes/generousContributionPaymentRoutes.ts
import express from "express";
import  BedPaymentAuController from "../controllers/ BedPaymentAu"; // Adjust path as needed
import authorizeUser from "../../../middlewares/authorizeUser";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import { paymentCreateDoc } from "../docs/paymentCreateDoc";
import { paymentCreateValidator } from "../validators/paymentCreateValidator";
import { generateReceiptPDF } from "../../../services/generatePdf";
import { paymentListDoc } from "../docs/paymentListDoc";

const router = express.Router();
const controller: any = new  BedPaymentAuController();

router.post(
  "/create",
  paymentCreateDoc,
  paymentCreateValidator,
  controller.createPayment
);
router.post("/payment-followup", controller.sendPaymentReminderController);
router.get("/public/:id", controller.getPaymentById);

router.get("/get-supporter-data/:id", paymentListDoc, controller.getSupporterDetails);

router.post("/verify", controller.verifyPayment);
router.post("/", controller.getPayments);

router.get("/payment-success", async (req, res) => {
  // Example input (replace with actual values from payment)
  const { phoneNo="918848196653" } = req.query;


  const paymentDetails: any = {
    name: "Well Wisher",
    amount: 3000,
    phoneNo,
    address: 'Alukkaparambil House, Karukulangara, \n' +
    'Irinjalakuda, Thrissur, Kerala-680121',
    date: "20 Dec 2024",
    transactionNumber: "9496277968",
    receiptNumber: "GC00-20598",
  };

  generateReceiptPDF(res, paymentDetails);
});






router.use(authenticateUser);

// Common authorization
const authorization = authorizeUser({ allowedRoles: [] });

// router.get("/", authorization, controller.getAllPayments);

router.get("/", controller.get);
router.get("/stats",  controller.getPaymentStats1);

/**
 * @route   GET /api/generous-payments/stats
 * @desc    Get payment statistics
 * @access  Private (Admin/Staff)
 */
router.get("/stats", authorization, controller.getPaymentStats);

/**
 * @route   GET /api/generous-payments/:id
 * @desc    Get payment by ID (full details)
 * @access  Private (Admin/Staff)
 */
router.get("/:id", authorization, controller.getPaymentById);

/**
 * @route   PUT /api/generous-payments/:id
 * @desc    Update payment details
 * @access  Private (Admin/Staff)
 */
router.put("/:id", authorization, controller.updatePayment);

/**
 * @route   DELETE /api/generous-payments/:id
 * @desc    Delete payment record
 * @access  Private (Admin only)
 */
router.delete("/:id", authorization, controller.deletePayment);

/**
 * @route   POST /api/generous-payments/manual
 * @desc    Create manual/offline payment record
 * @access  Private (Admin/Staff)
 */
//router.post("/manual", authorization, controller.createManualPayment);

/**
 * @route   POST /api/generous-payments/:id/refund
 * @desc    Process payment refund
 * @access  Private (Admin only)
 */
router.post("/:id/refund", authorization, controller.refundPayment);

export default router;
