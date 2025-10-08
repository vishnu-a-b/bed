// server/src/modules/GenerousContributionPaymentInd/routes/generousContributionPaymentIndRoutes.ts
import express from "express";
import GenerousContributionPaymentIndController from "../controllers/GenerousContributionPaymentIndController";
import authorizeUser from "../../../middlewares/authorizeUser";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import { paymentCreateDoc } from "../docs/paymentCreateDoc";
import { paymentCreateValidator } from "../validators/paymentCreateValidator";
import { generateReceiptPDF } from "../../../services/generatePdf";

const router = express.Router();
const controller: any = new GenerousContributionPaymentIndController();

router.post(
  "/create",
  paymentCreateDoc,
  paymentCreateValidator,
  controller.createPayment
);

router.get("/public/:id", controller.getPaymentById);

router.post("/verify", controller.verifyPayment);

router.get("/payment-success", async (req, res) => {
  // Example input (replace with actual values from payment)
  const { phoneNo="918848196653" } = req.query;

  const paymentDetails: any = {
    name: "Well Wisher",
    amount: 3000,
    phoneNo,
    address: 'Sample Address, City, State, India - 680121',
    date: "20 Dec 2024",
    transactionNumber: "9496277968",
    receiptNumber: "GCI00-20598",
  };

  generateReceiptPDF(res, paymentDetails);
});

router.post("/", controller.getPayments);
router.use(authenticateUser);

// Common authorization
const authorization = authorizeUser({ allowedRoles: [] });

router.get("/", controller.get);
router.get("/stats",  controller.getPaymentStats1);
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

export default router;
