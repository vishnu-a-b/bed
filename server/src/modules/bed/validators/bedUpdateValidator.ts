import { body } from "express-validator";
import { Country } from "../../country/models/Country";

import { Organization } from "../../organization/models/Organization";
import { User } from "../../user/models/User";
import { Bed } from "../models/Bed";


export const bedUpdateValidator = [
  body("head").custom(async (userId: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return Promise.reject("user not found");
        }
        const bed = await Bed.find({ user: user._id });
        if (bed && bed.length > 0) {
          return Promise.reject("there is already a bed for that userId");
        }
        return Promise.resolve();
      } catch (_) {
        return Promise.reject();
      }
    }),
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
