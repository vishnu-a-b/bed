import express, { Request, Response, NextFunction } from "express";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import multer from "multer";
import { multerFileStorage } from "../../../multer/multerConfig";
import { multerImageFilter } from "../../../multer/multerFileFilters";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";
import setFilterParams from "../../../middlewares/setFilterParams";
import { vcLinkUpdateDoc } from "../docs/vcLinkUpdateDoc";
import OrganizationController from "../controllers/OrganizationController";
import { organizationListDoc } from "../docs/organizationListDoc";
import { organizationFilterFields } from "../models/Organization";
import { organizationCountDoc } from "../docs/organizationCountDoc";
import { organizationDetailsDoc } from "../docs/organizationDetailsDoc";
import { organizationCreateDoc } from "../docs/organizationCreateDoc";
import { organizationCreateValidator } from "../validators/organization";
import { organizationUpdateDoc } from "../docs/organizationUpdateDoc";
import { organizationDeleteDoc } from "../docs/organizationDeleteDoc";
import { organizationListofAdminDoc } from "../docs/organizationListofAdminDoc";
import RolesEnum from "../../base/enums/roles";
import { body } from "express-validator";

const router = express.Router();
const controller = new OrganizationController();

router.use(authenticateUser);

const upload = multer({
  storage: multerFileStorage,
  fileFilter: multerImageFilter,
}).any();

const uploadMethod = (req: Request, res: Response, next: NextFunction) => {
  return upload(req, res, function (err) {
    if (err) {
      return next(new BadRequestError({ error: "invalid file type" }));
    }
    
    next();
  });
};

const authorization = authorizeUser({
  allowedRoles: [],
});

router.get(
  "/",
  organizationListDoc,
  setFilterParams(organizationFilterFields),
  controller.get
);

router.get(
  "/count-documents",
  organizationCountDoc,
  controller.countTotalDocuments
);

router.get("/:id", organizationDetailsDoc, controller.getOne);

router.post(
  "/",
  authorization,
  organizationCreateDoc,
  uploadMethod,
  organizationCreateValidator,
  controller.create
);
router.put(
  "/:id",
  authorization,
  organizationUpdateDoc,
  uploadMethod,
  organizationCreateValidator,
  controller.update
);
router.put(
  "/vcLink/:id",
  authorization,
  vcLinkUpdateDoc,
  controller.updateVcLink
);
router.delete("/:id", organizationDeleteDoc, authorization, controller.delete);

router.get(
  "/admin/:id",
  organizationListofAdminDoc,
  authorizeUser({ allowedRoles: [RolesEnum.organizationAdmin] }),
  controller.filterByAdmin
);

export default router;
