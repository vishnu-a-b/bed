import express from "express";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import setFilterParams from "../../../middlewares/setFilterParams";
import { bedListDoc } from "../docs/BedListDoc";
import { bedFilterFields } from "../models/Bed";
import { bedCountDoc } from "../docs/bedCountDoc";
import { bedDetailsDoc } from "../docs/bedDetailsDoc";
import { bedCreateDoc } from "../docs/bedCreateDoc";
import { bedCreateValidator } from "../validators/bedCreateValidator";
import { bedUpdateDoc } from "../docs/bedUpdateDoc";
import { bedUpdateValidator } from "../validators/bedUpdateValidator";
import BedController from "../controllers/BedController";
import { bedDeleteDoc } from "../docs/bedDeleteDoc";
import RolesEnum from "../../base/enums/roles";

const router = express.Router();
const controller = new BedController();

router.use(authenticateUser);

const authorization = authorizeUser({ allowedRoles: [] });

router.get(
  "/",
  bedListDoc,
  setFilterParams(bedFilterFields),
  controller.get
);
router.get("/count-documents", bedCountDoc, controller.countTotalDocuments);
router.get("/get-attendance", bedListDoc, controller.getWithAttendance);
router.get("/user/:id", bedDetailsDoc, controller.getWithUserId);
router.get("/:id", bedDetailsDoc, controller.getOne);
router.post(
  "/",
  bedCreateDoc,
  authorization,
  bedCreateValidator,
  controller.create
);
router.put(
  "/:id",
  bedUpdateDoc,
  bedUpdateValidator,
  controller.update
);
router.delete("/:id", bedDeleteDoc, authorization, controller.delete);

export default router;
