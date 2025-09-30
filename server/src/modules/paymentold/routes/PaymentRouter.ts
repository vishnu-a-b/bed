import express from "express";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import setFilterParams from "../../../middlewares/setFilterParams";

import PaymentController from "../controllers/Payment";

import { paymentFilterFields } from "../models/Payment"; // you'll define this like supporterFilterFields

// Swagger docs (optional if you’re using Swagger/OpenAPI)
import { paymentListDoc } from "../docs/paymentListDoc";
import { paymentCreateDoc } from "../docs/paymentCreateDoc";
import { paymentDetailsDoc } from "../docs/paymentDetailsDoc";
import { paymentCountDoc } from "../docs/paymentCountDoc";
import { paymentDeleteDoc } from "../docs/paymentDeleteDoc";
import { paymentUpdateDoc } from "../docs/paymentUpdateDoc";

// Validators (optional)
import { paymentCreateValidator } from "../validators/paymentCreateValidator";
import { paymentUpdateValidator } from "../validators/paymentUpdateValidator";
import {whatsappHelper}  from "../../../services/whatsapp-simple-helper";

const router = express.Router();
const controller = new PaymentController();

// Public Routes (if needed)
router.post(
  "/",
  paymentCreateDoc,
  paymentCreateValidator,
  controller.create
);
router.post('/send-hi', async (req, res) => {
  try {
    //const { phoneNumber } = req.body;
    const messageId = await whatsappHelper.sendHiMessage('8129470310');
    res.json({ success: true, messageId });
  } catch (error:any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get-supporter-data/:id", paymentListDoc, controller.getSupporterDetails);
router.post(
  "/create-order",
  paymentListDoc,
  async (req, res, next) => {
    try {
      await controller.createOrder(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Verify payment
router.post("/verify", controller.verifyPayment);

// Authentication required for all other routes
router.use(authenticateUser);

// Common authorization
const authorization = authorizeUser({ allowedRoles: [] });

router.get("/payment-head", paymentListDoc, controller.getPaymentHead);

router.post(
  "/get",
  paymentListDoc,
  setFilterParams(paymentFilterFields),
  controller.get
);

router.get(
  "/count-documents",
  paymentCountDoc,
  controller.countTotalDocuments
);

router.get("/:id", paymentDetailsDoc, controller.getOne);

router.put(
  "/:id",
  paymentUpdateDoc,
  paymentUpdateValidator,
  controller.update
);

router.delete("/:id", paymentDeleteDoc, authorization, controller.delete);

export default router;
