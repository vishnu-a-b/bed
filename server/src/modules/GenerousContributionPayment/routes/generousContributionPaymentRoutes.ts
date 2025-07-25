// server/src/modules/payment/routes/generousContributionPaymentRoutes.ts
import express from "express";
import GenerousContributionPaymentController from "../controllers/GenerousContributionPaymentController"; // Adjust path as needed
import authorizeUser from "../../../middlewares/authorizeUser";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import { paymentCreateDoc } from "../docs/paymentCreateDoc";
import { paymentCreateValidator } from "../validators/paymentCreateValidator";

const router = express.Router();
const controller:any = new GenerousContributionPaymentController();

router.post(
  "/create",
  paymentCreateDoc,
  paymentCreateValidator,
  controller.createPayment
);

router.get("/public/:id", controller.getPaymentById);

router.post("/verify", controller.verifyPayment);

router.use(authenticateUser);

// Common authorization
const authorization = authorizeUser({ allowedRoles: [] });

router.get("/", authorization, controller.getAllPayments);

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
router.delete(
  "/:id",
  authorization,
  controller.deletePayment
);

/**
 * @route   POST /api/generous-payments/manual
 * @desc    Create manual/offline payment record
 * @access  Private (Admin/Staff)
 */
router.post("/manual", authorization, controller.createManualPayment);

/**
 * @route   POST /api/generous-payments/:id/refund
 * @desc    Process payment refund
 * @access  Private (Admin only)
 */
router.post("/:id/refund", authorization, controller.refundPayment);

export default router;