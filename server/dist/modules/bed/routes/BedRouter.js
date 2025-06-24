"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUser_1 = require("../../authentication/middlewares/authenticateUser");
const authorizeUser_1 = __importDefault(require("../../../middlewares/authorizeUser"));
const setFilterParams_1 = __importDefault(require("../../../middlewares/setFilterParams"));
const bedListDoc_1 = require("../docs/bedListDoc");
const Bed_1 = require("../models/Bed");
const bedCountDoc_1 = require("../docs/bedCountDoc");
const bedDetailsDoc_1 = require("../docs/bedDetailsDoc");
const bedCreateDoc_1 = require("../docs/bedCreateDoc");
const bedCreateValidator_1 = require("../validators/bedCreateValidator");
const bedUpdateDoc_1 = require("../docs/bedUpdateDoc");
const bedUpdateValidator_1 = require("../validators/bedUpdateValidator");
const BedController_1 = __importDefault(require("../controllers/BedController"));
const bedDeleteDoc_1 = require("../docs/bedDeleteDoc");
const router = express_1.default.Router();
const controller = new BedController_1.default();
// const upload = multer({
//   storage: multerFileStorage,
//   fileFilter: multerImageFilter,
// }).any(); // allows multiple files
// const uploadMethod = (req: Request, res: Response, next: NextFunction) => {
//   return upload(req, res, function (err) {
//     if (err) {
//       return next(new BadRequestError({ error: "invalid file type" }));
//     }
//     // ✅ log incoming multipart/form-data
//     console.log("===== Incoming multipart/form-data Request =====");
//     console.log("🔸 req.body (form fields):", req.body);
//     console.log("🔸 req.files (uploaded files):", req.files);
//     console.log("================================================");
//     next();
//   });
// };
const authorization = (0, authorizeUser_1.default)({ allowedRoles: [] });
// Bed routes
router.get("/", bedListDoc_1.bedListDoc, (0, setFilterParams_1.default)(Bed_1.bedFilterFields), controller.get);
router.get("/count-documents", bedCountDoc_1.bedCountDoc, controller.countTotalDocuments);
router.get("/:id", bedDetailsDoc_1.bedDetailsDoc, controller.getOne);
router.use(authenticateUser_1.authenticateUser);
router.post("/", authorization, bedCreateDoc_1.bedCreateDoc, // Add if file uploads are needed
bedCreateValidator_1.bedCreateValidator, controller.create);
router.put("/:id", authorization, bedUpdateDoc_1.bedUpdateDoc, bedUpdateValidator_1.bedUpdateValidator, controller.update);
router.delete("/:id", authorization, bedDeleteDoc_1.bedDeleteDoc, controller.delete);
// Add any additional bed-specific routes here
// For example:
// router.put("/assign-patient/:id", authorization, controller.assignPatient);
exports.default = router;
