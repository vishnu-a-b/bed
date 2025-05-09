import { Request, Response, NextFunction } from "express";
import BaseController from "../../base/controllers.ts/BaseController";
import { validationResult } from "express-validator";
import ValidationFailedError from "../../../errors/errorTypes/ValidationFailedError";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import mongoose from "mongoose";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";
import UserService from "../../user/services/UserService";
import RolesEnum from "../../base/enums/roles";
import { User } from "../../user/models/User";
import { Role } from "../../role/models/Role";
import CountryService from "../services/CountryService";

export default class CountryController extends BaseController {
  service = new CountryService();
  userService = new UserService();
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationFailedError({ errors: errors.array() }));
        return;
      }

      const country = await this.service.create(req.body);
      const head: any = await this.userService.findOne(req.body.head);
      const headRole = await Role.findOne({ slug: RolesEnum.countryHead });
      if (head && headRole) {
        const roles = head.roles.map((role: any) => role._id as string);
        roles.push(headRole._id);
        await User.findByIdAndUpdate(
          { _id: head._id },
          {
            roles,
          }
        );
      }

      this.sendSuccessResponse(res, 201, { data: country });
    } catch (e: any) {
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, skip, search } = req.query;
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
      const country = await this.service.findOne(req.params.id);
      if (!country) {
        throw new NotFoundError({ error: "country not found" });
      }
      this.sendSuccessResponse(res, 200, { data: country });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid country_id" }));
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

      const country = await this.service.update({
        id: req.params.id,
        data: req.body,
      });
      if (!country) {
        throw new NotFoundError({ error: "country not found" });
      }
      this.sendSuccessResponse(res, 200, { data: { _id: country!._id } });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid country_id" }));
      }
      next(e);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const country = await this.service.delete(req.params.id);
      if (!country) {
        throw new NotFoundError({ error: "country not found" });
      }
      this.sendSuccessResponse(res, 204, { data: {} });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid country_id" }));
      }
      next(e);
    }
  };

  filterByHead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countrys = await this.service.filterByHead(req.params.id);
      this.sendSuccessResponse(res, 200, { data: countrys });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid head_id" }));
      }
      next(e);
    }
  };
}
