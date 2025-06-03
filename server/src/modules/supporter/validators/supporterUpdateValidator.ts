import { body } from "express-validator";

import { StaffRoles } from "../../base/enums/staffRoles";

import { StaffTypes } from "../../base/enums/staffTypes";
import { Bed } from "../../bed/models/Bed";

export const supporterUpdateValidator = [
  body("bed").custom(async (countryId: any) => {
    try {
      const country = await Bed.findById(countryId);
      if (!country) {
        return Promise.reject("country not found");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),

  body("role").optional().isIn(Object.values(StaffRoles))
];
