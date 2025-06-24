import { Request, Response, NextFunction } from "express";
import BaseController from "../../base/controllers.ts/BaseController";
import { validationResult } from "express-validator";
import ValidationFailedError from "../../../errors/errorTypes/ValidationFailedError";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";
import mongoose from "mongoose";
import PaymentService from "../services/PaymentService";

export default class PaymentController extends BaseController {
  service = new PaymentService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    console.log("create payment", req.body);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationFailedError({ errors: errors.array() }));
        return;
      }
      const payment = await this.service.create(req.body);
      this.sendSuccessResponse(res, 201, { data: payment });
    } catch (e: any) {
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip } = req.query;
      const { filterQuery, sort } = req;
      const data = await this.service.find({
        limit: Number(limit),
        skip: Number(skip),
        filterQuery,
        sort,
      });

      this.sendSuccessResponseList(res, 200, { data });
    } catch (e: any) {
      next(e);
    }
  };

  countTotalDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const count = await this.service.countTotalDocuments();
      this.sendSuccessResponse(res, 200, { data: { count } });
    } catch (e: any) {
      next(e);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await this.service.findOne(req.params.id);
      if (!payment) {
        throw new NotFoundError({ error: "payment not found" });
      }
      this.sendSuccessResponse(res, 200, { data: payment });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid payment_id" }));
      } else {
        next(e);
      }
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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationFailedError({ errors: errors.array() }));
        return;
      }
      console.log("update payment", req.body, req.params.id);
      const payment = await this.service.update({
        id: req.params.id,
        payment: req.body,
      });

      if (!payment) {
        throw new NotFoundError({ error: "payment not found" });
      }

      this.sendSuccessResponse(res, 200, { data: { _id: payment._id } });
    } catch (e: any) {
      console.error("Error in update payment:", e);
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid payment_id" }));
      } else {
        next(e);
      }
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await this.service.delete(req.params.id);
      if (!payment) {
        throw new NotFoundError({ error: "payment not found" });
      }
      this.sendSuccessResponse(res, 204, { data: {} });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid payment_id" }));
      } else {
        next(e);
      }
    }
  };
  createOrder= async(req: Request, res: Response)=> {
    try {
      console.log("create order", req.body);
      const {  supporterId } = req.body;

      const order = await this.service.createOrder({
        supporterId,     
      });

      res.json(order);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        if (error instanceof Error) {
          if (error instanceof Error) {
            res
              .status(500)
              .json({
                error:
                  error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
              });
          } else {
            res.status(500).json({ error: "An unknown error occurred" });
          }
        } else {
          res.status(500).json({ error: "An unknown error occurred" });
        }
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }

  verifyPayment= async(req: Request, res: Response)=> {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body;

      const payment = await this.service.verifyPayment({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      });

      res.json(payment);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
    }
  }
}
