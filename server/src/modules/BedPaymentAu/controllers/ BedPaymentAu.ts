// server/src/modules/payment/controllers/ BedPaymentAuController.ts
import { NextFunction, Request, Response } from "express";
import BedPaymentAuService from "../services/ BedPaymentAu";
import BaseController from "../../base/controllers.ts/BaseController";

export default class BedPaymentAuController extends BaseController {
  service = new BedPaymentAuService();

  // Create a new payment order
  createPayment = async (req: Request, res: Response) => {
    console.log(req.body);
    try {
      const { supporter, source } = req.body;

      // Validation
      if (!supporter) {
        return res.status(400).json({
          success: false,
          error: "Amount, contributor, and contribution details are required",
        });
      }

      const result = await this.service.createPayment({
        supporter,
        source,
      });

      return res.status(201).json(result);
    } catch (error: unknown) {
      console.error("Error in createPayment controller:", error);

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

  // Verify PayPal payment
  verifyPayment = async (req: Request, res: Response) => {
    try {
      const { paypal_order_id, paypal_payment_id } = req.body;

      if (!paypal_order_id) {
        return res.status(400).json({
          success: false,
          error: "PayPal order ID is required",
        });
      }

      const result = await this.service.verifyPayment({
        paypal_order_id,
      });

      return res.json(result);
    } catch (error) {
      console.error("Error in verifyPayment controller:", error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  sendPaymentReminderController = async (req: Request, res: Response) => {
    try {
      const { phoneNumber, email, name, amount, bedNo, supportLink, vcLink } =
        req.body;
      console.log(phoneNumber, email, name, amount, bedNo, supportLink);
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

  // Get all payments with filtering and pagination
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
        campaign,
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
      if (campaign) query.campaign = campaign;
      if (email) query["contributor.email"] = { $regex: email, $options: "i" };

      // Date range filter
      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) query.paymentDate.$gte = new Date(startDate as string);
        if (endDate) query.paymentDate.$lte = new Date(endDate as string);
      }

      // Add other filters
      Object.assign(query, otherFilters);

      const options = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sort: sort || "-createdAt",
        populate: true,
      };

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

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip } = req.query;
      const { filterQuery, sort } = req;
      const filters = req.body?.filters || {};
      const startDate = filters.startDate;
      const endDate = filters.endDate;

      const data = await this.service.find(
        {
          limit: Number(limit),
          skip: Number(skip),
          filterQuery,
          sort,
        },
        startDate,
        endDate
      );

      this.sendSuccessResponseList(res, 200, { data });
    } catch (e: any) {
      next(e);
    }
  };

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
        paypal_payment_id,
        paypal_order_id,
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

  getSupporterDetails = async (req: Request, res: Response) => {
    try {
      const supporterId = req.params.id; // Get from URL parameter
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
  // createManualPayment = async (req: Request, res: Response) => {
  //   try {
  //     const {
  //       amount,
  //       currency,
  //       contributor,
  //       contribution,
  //       manualMethod,
  //       transactionReference,
  //       remarks
  //     } = req.body;

  //     // Get recorded by user (from auth middleware)
  //     const recordedBy = (req as any).user?.id;

  //     const result = await this.service.createManualPayment({
  //       amount,
  //       currency,
  //       contributor,
  //       manualMethod,
  //       transactionReference,
  //       remarks,
  //       recordedBy
  //     });

  //     return res.status(201).json(result);

  //   } catch (error) {
  //     console.error("Error in createManualPayment controller:", error);

  //     return res.status(500).json({
  //       success: false,
  //       error: error instanceof Error ? error.message : "An unknown error occurred"
  //     });
  //   }
  // };

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
      const { startDate, endDate, groupBy = "day" } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      const matchStage = dateFilter ? { paymentDate: dateFilter } : {};

      // Aggregation pipeline for statistics
      const stats = await this.service.getAllPayments(matchStage);

      // You can add more complex aggregation logic here

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
  getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip, search, status__eq, paymentMode__eq } = req.query;
      const { filterQuery, sort } = req;

      console.log("Request body:", req.body);
      console.log("Query params:", req.query);

      const filters = req.body?.filters || {};

      // Only use dates if they're provided and not empty
      const startDate =
        filters.startDate && filters.startDate.trim()
          ? filters.startDate
          : undefined;
      const endDate =
        filters.endDate && filters.endDate.trim() ? filters.endDate : undefined;

      // Build additional filters from query params
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

  // getPayments = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { limit, skip } = req.query;
  //     const { filterQuery, sort } = req;
  //     console.log("Request body:", req.body);
  //     const filters = req.body?.filters || {};
  //     const startDate = filters.startDate;
  //     const endDate = filters.endDate;

  //     const data = await this.service.findPayments(
  //       {
  //         limit: Number(limit) || 10,
  //         skip: Number(skip) || 0,
  //         filterQuery: filterQuery || {},
  //         sort: sort || { paymentDate: -1 }, // Default sort by payment date descending
  //       },
  //       startDate,
  //       endDate
  //     );

  //     this.sendSuccessResponseList(res, 200, { data });
  //   } catch (e: any) {
  //     console.error("Error in getPayments controller:", e);
  //     next(e);
  //   }
  // };

  // Add these methods to your BedPaymentAuController class

  // Create manual/offline payment
  createManualPayment = async (req: Request, res: Response) => {
    try {
      const {
        amount,
        currency = "AUD",
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

      // Get recorded by user (from auth middleware)
      const recordedBy = (req as any).user?.id;

      // Validation
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

  // Manual approval for offline payments
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

      // Get approver user (from auth middleware)
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
}
