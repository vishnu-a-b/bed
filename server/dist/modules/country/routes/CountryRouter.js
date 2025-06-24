"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUser_1 = require("../../authentication/middlewares/authenticateUser");
const authorizeUser_1 = __importDefault(require("../../../middlewares/authorizeUser"));
const multer_1 = __importDefault(require("multer"));
const multerConfig_1 = require("../../../multer/multerConfig");
const multerFileFilters_1 = require("../../../multer/multerFileFilters");
const BadRequestError_1 = __importDefault(require("../../../errors/errorTypes/BadRequestError"));
const setFilterParams_1 = __importDefault(require("../../../middlewares/setFilterParams"));
const countryListDoc_1 = require("../docs/countryListDoc");
const Country_1 = require("../models/Country");
const countryCountDoc_1 = require("../docs/countryCountDoc");
const countryDetailsDoc_1 = require("../docs/countryDetailsDoc");
const countryCreateDoc_1 = require("../docs/countryCreateDoc");
const countryCreateValidator_1 = require("../validators/countryCreateValidator");
const countryUpdateDoc_1 = require("../docs/countryUpdateDoc");
const countryUpdateValidator_1 = require("../validators/countryUpdateValidator");
const countryDeleteDoc_1 = require("../docs/countryDeleteDoc");
const countryListofHeadDoc_1 = require("../docs/countryListofHeadDoc");
const CountryController_1 = __importDefault(require("../controllers/CountryController"));
const router = express_1.default.Router();
const controller = new CountryController_1.default();
router.use(authenticateUser_1.authenticateUser);
const upload = (0, multer_1.default)({
    storage: multerConfig_1.multerFileStorage,
    fileFilter: multerFileFilters_1.multerImageFilter,
}).any(); // allows multiple files
const uploadMethod = (req, res, next) => {
    return upload(req, res, function (err) {
        if (err) {
            return next(new BadRequestError_1.default({ error: "invalid file type" }));
        }
        // ✅ log incoming multipart/form-data
        console.log("===== Incoming multipart/form-data Request =====");
        console.log("🔸 req.body (form fields):", req.body);
        console.log("🔸 req.files (uploaded files):", req.files);
        console.log("================================================");
        next();
    });
};
const authorization = (0, authorizeUser_1.default)({
    allowedRoles: [],
});
// GET routes
router.get("/", countryListDoc_1.countryListDoc, (0, setFilterParams_1.default)(Country_1.countryFilterFields), controller.get);
router.get("/count-documents", countryCountDoc_1.countryCountDoc, controller.countTotalDocuments);
router.get("/:id", countryDetailsDoc_1.countryDetailsDoc, controller.getOne);
// ✅ POST route with file upload + logging
router.post("/", authorization, countryCreateDoc_1.countryCreateDoc, uploadMethod, // add file upload middleware here
countryCreateValidator_1.countryCreateValidator, controller.create);
// ✅ PUT route with file upload + logging
router.put("/:id", authorization, countryUpdateDoc_1.countryUpdateDoc, uploadMethod, // add file upload middleware here
countryUpdateValidator_1.countryUpdateValidator, controller.update);
router.delete("/:id", countryDeleteDoc_1.countryDeleteDoc, authorization, controller.delete);
router.get("/head/:id", countryListofHeadDoc_1.countryListofHeadDoc, authorization, controller.filterByHead);
exports.default = router;
