import { Request, Response, NextFunction } from "express";
import BaseController from "../../base/controllers.ts/BaseController";
import { validationResult } from "express-validator";
import ValidationFailedError from "../../../errors/errorTypes/ValidationFailedError";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import mongoose from "mongoose";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";
import Configs from "../../../configs/configs";
import UserService from "../../user/services/UserService";
import OrganizationService from "../services/OrganizationService";
import RolesEnum from "../../base/enums/roles";
import { Role } from "../../role/models/Role";
import { User } from "../../user/models/User";

export default class OrganizationController extends BaseController {
  service = new OrganizationService();
  userService = new UserService();
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationFailedError({ errors: errors.array() }));
        return;
      }
      let photoUrls: any[] = [];
      if (req.files) {
        (req.files as Express.Multer.File[])!.forEach((file) => {
          photoUrls.push(Configs.domain + file.filename);
        });
        req.body.photos = photoUrls;
      }
      const organization = await this.service.create(req.body);
      const admin: any = await this.userService.findOne(req.body.admin);
      const adminRole = await Role.findOne({ slug: RolesEnum.organizationAdmin });
      if (admin && adminRole) {
        const roles = admin.roles.map((role: any) => role._id as string);
        roles.push(adminRole._id);
        await User.findByIdAndUpdate(
          { _id: admin._id },
          {
            roles,
          }
        );
      }

      this.sendSuccessResponse(res, 201, { data: organization });
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
      const organization = await this.service.findOne(req.params.id);
      if (!organization) {
        throw new NotFoundError({ error: "organization not found" });
      }
      this.sendSuccessResponse(res, 200, { data: organization });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid organization_id" }));
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
      let photoUrls: any[] = [];
      if (req.files) {
        (req.files as Express.Multer.File[])!.forEach((file) => {
          photoUrls.push(Configs.domain + file.filename);
        });
        req.body.photos = photoUrls;
      }
      const organization = await this.service.update({
        id: req.params.id,
        organization: req.body,
      });
      if (!organization) {
        throw new NotFoundError({ error: "organization not found" });
      }
      this.sendSuccessResponse(res, 200, { data: { _id: organization!._id } });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid organization_id" }));
      }
      next(e);
    }
  };
  updateVcLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { vcLink } = req.body;
      if (!vcLink) {
        next(new ValidationFailedError({ errors: ["vcLink required"] }));
        return;
      }
      const organization = await this.service.update({
        id: req.params.id,
        organization: { vcLink },
      });
      if (!organization) {
        throw new NotFoundError({ error: "organization not found" });
      }
      this.sendSuccessResponse(res, 200, { data: { _id: organization!._id } });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid organization_id" }));
      }
      next(e);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organization = await this.service.delete(req.params.id);
      if (!organization) {
        throw new NotFoundError({ error: "organization not found" });
      }
      this.sendSuccessResponse(res, 204, { data: {} });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid organization_id" }));
      }
      next(e);
    }
  };

  filterByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationes = await this.service.filterByAdmin(req.params.id);
      this.sendSuccessResponse(res, 200, { data: organizationes });
    } catch (e: any) {
      if (e instanceof mongoose.Error.CastError) {
        next(new BadRequestError({ error: "invalid admin_d" }));
      }
      next(e);
    }
  };
}
