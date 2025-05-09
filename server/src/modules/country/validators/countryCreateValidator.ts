import { body } from "express-validator";
import CustomValidators from "../../base/customValidators/customValidators";
import { User } from "../../user/models/User";
import { Organization } from "../../organization/models/Organization";

export const countryCreateValidator = [
  body("name")
    .custom(CustomValidators.isNotEmptyAndString)
    .isLength({ max: 50 }),

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

  body("head").custom(async (headId: any) => {
    try {
      const head = await User.findById(headId);
      if (!head) {
        return Promise.reject("user not found");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),
];
