import { body } from "express-validator";
import CustomValidators from "../../base/customValidators/customValidators";

import { User } from "../../user/models/User";
import { Organization } from "../../organization/models/Organization";

export const countryUpdateValidator = [
  body("name")
    .optional()
    .custom(CustomValidators.isNotEmptyAndString)
    .isLength({ max: 50 }),
  body("organization")
    .optional()
    .custom(async (organizationId: any) => {
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

  body("head")
    .optional()
    .custom(async (headId: any) => {
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
