import { body } from "express-validator";
import { Country } from "../../country/models/Country";
import { StaffRoles } from "../../base/enums/staffRoles";
import { Organization } from "../../organization/models/Organization";
import { StaffTypes } from "../../base/enums/staffTypes";

export const staffUpdateValidator = [
  body("country")
    .optional()
    .custom(async (countryId: any) => {
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
  body("joinDate").optional().isISO8601(),
  body("role").optional().isIn(Object.values(StaffRoles)),
  body("type").optional().isIn(Object.values(StaffTypes)),
];
