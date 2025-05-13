import express, { Request, Response, NextFunction } from "express";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import multer from "multer";
import { multerFileStorage } from "../../../multer/multerConfig";
import { multerImageFilter } from "../../../multer/multerFileFilters";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";
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

const upload = multer({
  storage: multerFileStorage,
  fileFilter: multerImageFilter,
}).any(); // allows multiple files

const uploadMethod = (req: Request, res: Response, next: NextFunction) => {
  return upload(req, res, function (err) {
    if (err) {
      return next(new BadRequestError({ error: "invalid file type" }));
    }

    // ✅ log incoming multipart/form-data
    console.log("===== Incoming multipart/form-data Request =====");
    console.log("🔸 req.body (form fields):", req.body);
    console.log("🔸 req.files (uploaded files):", req.files);
    console.log("================================================");

    next();
  });
};

const authorization = authorizeUser({
  allowedRoles: [],
});

// GET routes
router.get(
  "/",
  countryListDoc,
  setFilterParams(countryFilterFields),
  controller.get
);

router.get("/count-documents", countryCountDoc, controller.countTotalDocuments);

router.get("/:id", countryDetailsDoc, controller.getOne);

// ✅ POST route with file upload + logging
router.post(
  "/",
  authorization,
  countryCreateDoc,
  uploadMethod, // add file upload middleware here
  countryCreateValidator,
  controller.create
);

// ✅ PUT route with file upload + logging
router.put(
  "/:id",
  authorization,
  countryUpdateDoc,
  uploadMethod, // add file upload middleware here
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
