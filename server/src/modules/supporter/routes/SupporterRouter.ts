import express from "express";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import setFilterParams from "../../../middlewares/setFilterParams";
import { supporterListDoc } from "../docs/supporterListDoc";
import { supporterFilterFields } from "../models/Supporter";
import { supporterCountDoc } from "../docs/supporterCountDoc";
import { supporterDetailsDoc } from "../docs/supporterDetailsDoc";
import { supporterCreateDoc } from "../docs/supporterCreateDoc";
import { supporterCreateValidator } from "../validators/supporerCreateValidator";
import { supporterUpdateDoc } from "../docs/supporterUpdateDoc";
import { supporterUpdateValidator } from "../validators/supporterUpdateValidator";
import SupporterController from "../controllers/Supporter";
import { supporterDeleteDoc } from "../docs/supporterDeleteDoc";
import RolesEnum from "../../base/enums/roles";

const router = express.Router();
const controller = new SupporterController();
router.get("/get-all-data", supporterListDoc, controller.getAllData);
router.use(authenticateUser);

const authorization = authorizeUser({ allowedRoles: [] });

router.get(
  "/",
  supporterListDoc,
  setFilterParams(supporterFilterFields),
  controller.get
);
router.get(
  "/count-documents",
  supporterCountDoc,
  controller.countTotalDocuments
);

router.get("/user/:id", supporterDetailsDoc, controller.getWithUserId);
router.get("/:id", supporterDetailsDoc, controller.getOne);
router.post(
  "/",
  supporterCreateDoc,
  authorization,
  supporterCreateValidator,
  controller.create
);
router.put(
  "/:id",
  supporterUpdateDoc,
  authorizeUser({ allowedRoles: [RolesEnum.staff] }),
  supporterUpdateValidator,
  controller.update
);
router.delete("/:id", supporterDeleteDoc, authorization, controller.delete);

export default router;
