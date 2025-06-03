import express from "express";
import IndexRouter from "./IndexRouter";
import AuthenticationRouter from "../modules/authentication/routes/AuthenticationRouter";
import UserRouter from "../modules/user/routes/UserRouter";
import RoleRouter from "../modules/role/routes/RoleRouter";
import AccountRouter from "../modules/account/routes/AccountRouter";
import AddressRouter from "../modules/address/routes/AddressRouter";
import CountryRouter from "../modules/country/routes/CountryRouter";
import StaffRouter from "../modules/staff/routes/StaffRouter";
import BedRouter from "../modules/bed/routes/BedRouter";
import OrganizationRouter from "../modules/organization/routes/Organization";
import SupporterRouter from "../modules/supporter/routes/SupporterRouter";



const router = express.Router();

router.use("/", IndexRouter);
router.use("/v1/auth/", AuthenticationRouter);
router.use("/v1/role/", RoleRouter);
router.use("/v1/user/", UserRouter);
router.use("/v1/account/", AccountRouter);
router.use("/v1/address/", AddressRouter);
router.use("/v1/organization/", OrganizationRouter);
router.use("/v1/country/", CountryRouter);
router.use("/v1/staff/", StaffRouter);
router.use("/v1/supporter/", SupporterRouter);
router.use("/v1/bed/", BedRouter);


export default router;
