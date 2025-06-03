import express, { Request, Response, NextFunction } from "express";
import UserController from "../controllers/UserController";
import { userCreateValidator } from "../validators/UserCreateValidator";
import { authenticateUser } from "../../authentication/middlewares/authenticateUser";
import authorizeUser from "../../../middlewares/authorizeUser";
import multer from "multer";
import { multerFileStorageForUserData } from "../../../multer/multerConfig";
import { multerImageFilter } from "../../../multer/multerFileFilters";
import BadRequestError from "../../../errors/errorTypes/BadRequestError";
import setFilterParams from "../../../middlewares/setFilterParams";
import { userFilterFields } from "../models/User";
import { userCreateDoc } from "../docs/userCreateDoc";
import { userListDoc } from "../docs/userListDoc";
import { userDetailsDoc } from "../docs/userDetailsDoc";
import { userUpdateDoc } from "../docs/userUpdateDoc";
import { userUpdateValidator } from "../validators/UserUpdateValidator";
import { userDeleteDoc } from "../docs/userDeleteDoc";
import RolesEnum from "../../base/enums/roles";
import { updatePasswordDoc } from "../docs/updatePasswordDoc";
import { updatePasswordValidator } from "../validators/updatePasswordValidator";
const router = express.Router();

const controller = new UserController();



const multiUpload = multer({
  storage: multerFileStorageForUserData,
  fileFilter: multerImageFilter,
}).fields([{ name: "photos" }, { name: "profilePicture", maxCount: 1 }]);

const uploadMethod = (req: Request, res: Response, next: NextFunction) => {
  return multiUpload(req, res, function (err) {
    if (err) {
      console.log("upload error", err);
      return next(new BadRequestError({ error: "invalid file type" }));
    }
    next();
  });
};

router.get(
  "/",
  setFilterParams(userFilterFields),
  userListDoc,
  controller.getList
);

router.get(
  "/filter-by-role/:slug",
  setFilterParams(userFilterFields),
  userListDoc,
  controller.filterByRole
);
router.post(
  "/",
  uploadMethod,
  userCreateValidator,
  userCreateDoc,
  controller.create
);

router.use(authenticateUser);

router.get(
  "/:id",
  authorizeUser({ allowedRoles: [] }),
  userDetailsDoc,
  controller.getOne
);
router.put(
  "/:id",
  authorizeUser({ allowedRoles: [] }),
  userUpdateDoc,
  userUpdateValidator,
  controller.update
);

router.put(
  "/update-password/:id",
  authorizeUser({ allowedRoles: [RolesEnum.staff] }),
  updatePasswordDoc,
  updatePasswordValidator,
  controller.updatePassword
);

router.delete(
  "/:id",
  authenticateUser,
  userDeleteDoc,
  authorizeUser({ allowedRoles: [] }),
  controller.delete
);

export default router;
