// server/src/modules/BedPaymentIn/controllers/BedPaymentInd.ts
import { NextFunction, Request, Response } from "express";
import BedPaymentIndService from "../services/BedPaymentInd";
import BaseController from "../../base/controllers.ts/BaseController";

export default class BedPaymentIndController extends BaseController {
  service = new BedPaymentIndService();

  // Create a new Razorpay order
  createOrder = async (req: Request, res: Response) => {
    try {
      const { supporterId } = req.body;

      if (!supporterId) {
        return res.status(400).json({
          success: false,
          error: "Supporter ID is required",
        });
      }

      const result = await this.service.createOrder({ supporterId });

      return res.json({
        success: true,
        data: {
          orderId: result.data.orderId,
          amount: result.data.amount,
          currency: result.data.currency,
          key: result.data.key,
        },
      });
    } catch (error: unknown) {
      console.error("Error in createOrder controller:", error);

      let statusCode = 500;
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("not found")) {
          statusCode = 404;
        } else if (
          error.message.includes("required") ||
          error.message.includes("Invalid")
        ) {
          statusCode = 400;
        }
      }

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  };

  // Verify Razorpay payment
  verifyPayment = async (req: Request, res: Response) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: "Payment ID, Order ID, and Signature are required",
        });
      }

      const payment = await this.service.verifyPayment({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      });

      return res.json(payment);
    } catch (error) {
      console.error("Error in verifyPayment controller:", error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Send payment reminder
  sendPaymentReminderController = async (req: Request, res: Response) => {
    try {
      const { phoneNumber, email, name, amount, bedNo, supportLink, vcLink } =
        req.body;

      const result = await this.service.sendPaymentReminder({
        phoneNumber,
        email,
        name,
        amount,
        bedNo,
        supportLink,
        vcLink,
      });

      res.status(200).json({
        success: true,
        message: `Payment reminder sent successfully`,
        results: result,
      });
    } catch (error: any) {
      console.error("Error sending payment reminder:", error.message || error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send payment reminder",
      });
    }
  };

  // Get all payments with filtering
  getAllPayments = async (req: Request, res: Response) => {
    try {
      const {
        page,
        limit,
        sort,
        status,
        currency,
        purpose,
        source,
        email,
        startDate,
        endDate,
        ...otherFilters
      } = req.query;

      // Build query filters
      const query: any = {};

      if (status) query.status = status;
      if (currency) query.currency = currency;
      if (purpose) query["contribution.purpose"] = purpose;
      if (source) query.source = source;
      if (email) query.email = { $regex: email, $options: "i" };

      // Date range filter
      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) query.paymentDate.$gte = new Date(startDate as string);
        if (endDate) query.paymentDate.$lte = new Date(endDate as string);
      }

      Object.assign(query, otherFilters);

      const result = await this.service.getAllPayments(query);

      return res.json(result);
    } catch (error) {
      console.error("Error in getAllPayments controller:", error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Get payment by ID
  getPaymentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
      }

      const result = await this.service.getPaymentById(id);

      return res.json(result);
    } catch (error) {
      console.error("Error in getPaymentById controller:", error);

      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;

      return res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Get payment statistics
  getPaymentStats1 = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stats = await this.service.getPaymentStatistics();

      this.sendSuccessResponse(res, 200, {
        message: "Payment statistics retrieved successfully",
        data: stats,
      });
    } catch (e: any) {
      console.error("Error in getPaymentStats controller:", e);
      next(e);
    }
  };

  // Get payments with filters
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip, startDate, endDate } = req.query;
      const { filterQuery, sort } = req;

      const data = await this.service.find(
        {
          limit: Number(limit),
          skip: Number(skip),
          filterQuery,
          sort,
        },
        startDate as string,
        endDate as string
      );

      this.sendSuccessResponseList(res, 200, { data });
    } catch (e: any) {
      next(e);
    }
  };

  // Get payments with advanced search
  getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip, search, status__eq, paymentMode__eq } = req.query;
      const { filterQuery, sort } = req;

      const filters = req.body?.filters || {};

      const startDate =
        filters.startDate && filters.startDate.trim()
          ? filters.startDate
          : undefined;
      const endDate =
        filters.endDate && filters.endDate.trim() ? filters.endDate : undefined;

      let additionalFilters: any = {};
      if (status__eq && status__eq !== "all") {
        additionalFilters.status = status__eq;
      }
      if (paymentMode__eq && paymentMode__eq !== "all") {
        additionalFilters.paymentMode = paymentMode__eq;
      }

      const data = await this.service.findPayments(
        {
          limit: Number(limit) || 10,
          skip: Number(skip) || 0,
          filterQuery: { ...filterQuery, ...additionalFilters },
          sort: sort || { paymentDate: -1 },
          search: search as string,
        },
        startDate,
        endDate
      );

      this.sendSuccessResponseList(res, 200, { data });
    } catch (e: any) {
      console.error("Error in getPayments controller:", e);
      next(e);
    }
  };

  // Update payment
  updatePayment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
      }

      // Remove fields that shouldn't be updated directly
      const {
        razorpay_payment_id,
        razorpay_order_id,
        status,
        isVerified,
        ...allowedUpdates
      } = updateData;

      const result = await this.service.updatePayment({
        id,
        updateData: allowedUpdates,
      });

      return res.json(result);
    } catch (error) {
      console.error("Error in updatePayment controller:", error);

      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;

      return res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Delete payment
  deletePayment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
      }

      const result = await this.service.deletePayment(id);

      return res.json(result);
    } catch (error) {
      console.error("Error in deletePayment controller:", error);

      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;

      return res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Get supporter details with payments
  getSupporterDetails = async (req: Request, res: Response) => {
    try {
      const supporterId = req.params.id;
      const result = await this.service.findOneSupporterPayments(supporterId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(404).json({ message: "An unknown error occurred" });
      }
    }
  };

  // Create manual/offline payment
  createManualPayment = async (req: Request, res: Response) => {
    try {
      const {
        amount,
        currency = "INR",
        name,
        email,
        phNo,
        address,
        manualMethod,
        transactionReference,
        paymentDate,
        remarks,
        contribution,
        source = "website",
        supporter,
        bed,
      } = req.body;

      const recordedBy = (req as any).user?.id;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Amount must be greater than 0",
        });
      }

      if (!manualMethod) {
        return res.status(400).json({
          success: false,
          error: "Manual payment method is required",
        });
      }

      const result = await this.service.createManualPayment({
        amount,
        currency,
        name,
        email,
        phNo,
        address,
        manualMethod,
        transactionReference,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        remarks,
        contribution,
        source,
        recordedBy,
        supporter,
        bed,
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error in createManualPayment controller:", error);

      let statusCode = 500;
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("not found")) {
          statusCode = 404;
        } else if (
          error.message.includes("required") ||
          error.message.includes("Invalid")
        ) {
          statusCode = 400;
        }
      }

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  };

  // Approve/reject manual payment
  approveManualPayment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approved = true, remarks } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
      }

      const approvedBy = (req as any).user?.id;

      if (!approvedBy) {
        return res.status(401).json({
          success: false,
          error: "User authentication required",
        });
      }

      const result = await this.service.approveManualPayment({
        id,
        approved,
        approvedBy,
        remarks,
      });

      return res.json(result);
    } catch (error) {
      console.error("Error in approveManualPayment controller:", error);

      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;

      return res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Refund payment
  refundPayment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
      }

      const result = await this.service.refundPayment(id, {
        amount,
        reason,
      });

      return res.json(result);
    } catch (error) {
      console.error("Error in refundPayment controller:", error);

      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;

      return res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Get payment statistics
  getPaymentStats = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      const matchStage = dateFilter ? { paymentDate: dateFilter } : {};

      const stats = await this.service.getAllPayments(matchStage);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error in getPaymentStats controller:", error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };
}
