import { Request, Response, NextFunction } from "express";
import BaseController from "../../base/controllers.ts/BaseController";
import { validationResult } from "express-validator";
import ValidationFailedError from "../../../errors/errorTypes/ValidationFailedError";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import mongoose from "mongoose";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";
import SupporterService from "../services/SupporterService";
import supporterMailer from "../../../services/mailService";

export default class SupporterController extends BaseController {
  service = new SupporterService();
  create = async (req: Request, res: Response, next: NextFunction) => {
    console.log("create supporter", req.body);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationFailedError({ errors: errors.array() }));
        return;
      }
      const supporter: any = await this.service.create(req.body);
      if (supporter && supporter._id) {
        await supporterMailer.sendWelcomeEmail({
          supporterId: supporter._id.toString(),
        });
      }
      this.sendSuccessResponse(res, 201, { data: supporter });
    } catch (e: any) {
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip } = req.query;
      const { filterQuery, sort } = req;
      console.log(req.body);
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

  getSupporter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip } = req.query;
      const { filterQuery, sort } = req;
      const data = await this.service.findSupporter({
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

  getAllData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.findAllData();

      this.sendSuccessResponseList(res, 200, { data });
    } catch (e: any) {
      next(e);
    }
  };

  getSupporterHead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("getSupporterHead called");
      const data: any = await this.service.findHeadingData();

      this.sendSuccessResponseList(res, 200, { data });
    } catch (e: any) {
      next(e);
    }
  };

  // In your controller
  getCountryDetails = async (req: Request, res: Response) => {
    try {
      const countryId = req.params.id; // Get from URL parameter
      const result = await this.service.findOneCountryData(countryId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(404).json({ message: "An unknown error occurred" });
      }
    }
  };

  getBedDetails = async (req: Request, res: Response) => {
    try {
      const bedId = req.params.id; // Get from URL parameter
      const result = await this.service.findOneBedData(bedId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(404).json({ message: "An unknown error occurred" });
      }
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
      const supporter = await this.service.findOne(req.params.id);
      if (!supporter) {
        throw new NotFoundError({ error: "supporter not found" });
      }
      this.sendSuccessResponse(res, 200, { data: supporter });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid supporter_id" }));
      }
      next(e);
    }
  };

  getWithUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supporter = await this.service.findOneWithUserId(req.params.id);
      this.sendSuccessResponse(res, 200, { data: supporter });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid supporter_id" }));
      }
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationFailedError({ errors: errors.array() }));
        return;
      }

      const supporter = await this.service.update({
        id: req.params.id,
        supporter: req.body,
      });
      if (!supporter) {
        throw new NotFoundError({ error: "supporter not found" });
      }
      this.sendSuccessResponse(res, 200, { data: { _id: supporter!._id } });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid supporter_id" }));
      }
      next(e);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supporter = await this.service.delete(req.params.id);
      if (!supporter) {
        throw new NotFoundError({ error: "supporter not found" });
      }
      this.sendSuccessResponse(res, 204, { data: {} });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid supporter_id" }));
      }
      next(e);
    }
  };
}
