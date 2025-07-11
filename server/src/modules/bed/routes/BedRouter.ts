import express, { Request, Response, NextFunction } from "express";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import setFilterParams from "../../../middlewares/setFilterParams";
import { bedListDoc } from "../docs/bedListDoc";
import { bedFilterFields } from "../models/Bed";
import { bedCountDoc } from "../docs/bedCountDoc";
import { bedDetailsDoc } from "../docs/bedDetailsDoc";
import { bedCreateDoc } from "../docs/bedCreateDoc";
import { bedCreateValidator } from "../validators/bedCreateValidator";
import { bedUpdateDoc } from "../docs/bedUpdateDoc";
import { bedUpdateValidator } from "../validators/bedUpdateValidator";
import BedController from "../controllers/BedController";
import { bedDeleteDoc } from "../docs/bedDeleteDoc";
import multer from "multer";
import { multerFileStorage, multerFileStorageForQr } from "../../../multer/multerConfig";
import { multerImageFilter } from "../../../multer/multerFileFilters";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";

const router = express.Router();
const controller = new BedController();


const upload = multer({
  storage: multerFileStorageForQr,
  fileFilter: multerImageFilter,
}).single("qrPhoto");

const uploadMethod = (req: Request, res: Response, next: NextFunction) => {
  return upload(req, res, function (err) {
    if (err) {
      return next(new BadRequestError({ error: "invalid file type" }));
    }
    console.log("===== Incoming multipart/form-data Request =====");
    console.log("🔸 req.body (form fields):", req.body);
    console.log("🔸 req.files (uploaded files):", req.file);
    console.log("================================================");

    next();
  });
};




const authorization = authorizeUser({ allowedRoles: [] });


// Bed routes
router.get(
  "/",
  bedListDoc,
  setFilterParams(bedFilterFields),
  controller.get
);

router.get(
  "/count-documents",
  bedCountDoc,
  controller.countTotalDocuments
);



router.get(
  "/:id",
  bedDetailsDoc,
  controller.getOne
);

router.use(authenticateUser);

router.post(
  "/",
  authorization,
  bedCreateDoc, // Add if file uploads are needed
  uploadMethod,
  bedCreateValidator,
  controller.create
);

router.put(
  "/:id",
  authorization,
  bedUpdateDoc, 
  uploadMethod,
  bedUpdateValidator,
  controller.update
);

router.delete(
  "/:id",
  authorization,
  bedDeleteDoc,
  controller.delete
);

// Add any additional bed-specific routes here
// For example:
// router.put("/assign-patient/:id", authorization, controller.assignPatient);

export default router;