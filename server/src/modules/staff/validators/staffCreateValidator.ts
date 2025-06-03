import { body } from "express-validator";
import { User } from "../../user/models/User";
import { Country } from "../../country/models/Country";
import { StaffRoles } from "../../base/enums/staffRoles";
import { Staff } from "../models/Staff";
import { Organization } from "../../organization/models/Organization";
import { StaffTypes } from "../../base/enums/staffTypes";

export const staffCreateValidator = [
  body("user").custom(async (userId: any) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return Promise.reject("user not found");
      }
      const staff = await Staff.find({ user: user._id });
      if (staff && staff.length > 0) {
        return Promise.reject("there is already a staff for that userId");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),
  body("country").custom(async (countryId: any) => {
    try {
      const country = await Country.findById(countryId);
      if (!country) {
        return Promise.reject("country not found");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),
  body("organization").custom(async (organizationId: any) => {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return Promise.reject("organization not found");
      }

      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),
  body("role").isIn(Object.values(StaffRoles)),
];
