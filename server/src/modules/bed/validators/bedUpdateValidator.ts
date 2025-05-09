import { body } from "express-validator";
import { Country } from "../../country/models/Country";

import { Organization } from "../../organization/models/Organization";


export const bedUpdateValidator = [
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
  
];
