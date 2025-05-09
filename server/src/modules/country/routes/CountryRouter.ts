import express, { Request, Response, NextFunction } from "express";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import setFilterParams from "../../../middlewares/setFilterParams";
import { countryListDoc } from "../docs/countryListDoc";
import { countryFilterFields } from "../models/Country";
import { countryCountDoc } from "../docs/countryCountDoc";
import { countryDetailsDoc } from "../docs/countryDetailsDoc";
import { countryCreateDoc } from "../docs/countryCreateDoc";
import { countryCreateValidator } from "../validators/countryCreateValidator";
import { countryUpdateDoc } from "../docs/countryUpdateDoc";
import { countryUpdateValidator } from "../validators/countryUpdateValidator";
import { countryDeleteDoc } from "../docs/countryDeleteDoc";
import { countryListofHeadDoc } from "../docs/countryListofHeadDoc";
import CountryController from "../controllers/CountryController";

const router = express.Router();
const controller = new CountryController();

router.use(authenticateUser);

const authorization = authorizeUser({
  allowedRoles: [],
});

router.get(
  "/",
  countryListDoc,
  setFilterParams(countryFilterFields),
  controller.get
);

router.get(
  "/count-documents",
  countryCountDoc,
  controller.countTotalDocuments
);

router.get("/:id", countryDetailsDoc, controller.getOne);

router.post(
  "/",
  authorization,
  countryCreateDoc,
  countryCreateValidator,
  controller.create
);
router.put(
  "/:id",
  authorization,
  countryUpdateDoc,
  countryUpdateValidator,
  controller.update
);

router.delete("/:id", countryDeleteDoc, authorization, controller.delete);
router.get(
  "/head/:id",
  countryListofHeadDoc,
  authorization,
  controller.filterByHead
);

export default router;
