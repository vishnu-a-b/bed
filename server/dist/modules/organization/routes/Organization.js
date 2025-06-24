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
const vcLinkUpdateDoc_1 = require("../docs/vcLinkUpdateDoc");
const OrganizationController_1 = __importDefault(require("../controllers/OrganizationController"));
const organizationListDoc_1 = require("../docs/organizationListDoc");
const Organization_1 = require("../models/Organization");
const organizationCountDoc_1 = require("../docs/organizationCountDoc");
const organizationDetailsDoc_1 = require("../docs/organizationDetailsDoc");
const organizationCreateDoc_1 = require("../docs/organizationCreateDoc");
const organization_1 = require("../validators/organization");
const organizationUpdateDoc_1 = require("../docs/organizationUpdateDoc");
const organizationDeleteDoc_1 = require("../docs/organizationDeleteDoc");
const organizationListofAdminDoc_1 = require("../docs/organizationListofAdminDoc");
const roles_1 = __importDefault(require("../../base/enums/roles"));
const router = express_1.default.Router();
const controller = new OrganizationController_1.default();
router.use(authenticateUser_1.authenticateUser);
const upload = (0, multer_1.default)({
    storage: multerConfig_1.multerFileStorage,
    fileFilter: multerFileFilters_1.multerImageFilter,
}).any();
const uploadMethod = (req, res, next) => {
    return upload(req, res, function (err) {
        if (err) {
            return next(new BadRequestError_1.default({ error: "invalid file type" }));
        }
        next();
    });
};
const authorization = (0, authorizeUser_1.default)({
    allowedRoles: [],
});
router.get("/", organizationListDoc_1.organizationListDoc, (0, setFilterParams_1.default)(Organization_1.organizationFilterFields), controller.get);
router.get("/count-documents", organizationCountDoc_1.organizationCountDoc, controller.countTotalDocuments);
router.get("/:id", organizationDetailsDoc_1.organizationDetailsDoc, controller.getOne);
router.post("/", authorization, organizationCreateDoc_1.organizationCreateDoc, uploadMethod, organization_1.organizationCreateValidator, controller.create);
router.put("/:id", authorization, organizationUpdateDoc_1.organizationUpdateDoc, uploadMethod, organization_1.organizationCreateValidator, controller.update);
router.put("/vcLink/:id", authorization, vcLinkUpdateDoc_1.vcLinkUpdateDoc, controller.updateVcLink);
router.delete("/:id", organizationDeleteDoc_1.organizationDeleteDoc, authorization, controller.delete);
router.get("/admin/:id", organizationListofAdminDoc_1.organizationListofAdminDoc, (0, authorizeUser_1.default)({ allowedRoles: [roles_1.default.organizationAdmin] }), controller.filterByAdmin);
exports.default = router;
