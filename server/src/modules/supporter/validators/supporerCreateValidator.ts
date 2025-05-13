import { body } from "express-validator";
import { User } from "../../user/models/User";

import { StaffRoles } from "../../base/enums/staffRoles";
import { Supporter } from "../models/Supporter";
import { Bed } from "../../bed/models/Bed";


export const supporterCreateValidator = [
  body("user").custom(async (userId: any) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return Promise.reject("user not found");
      }
      const supporter = await Supporter.find({ user: user._id });
      if (supporter && supporter.length > 0) {
        return Promise.reject("there is already a supporter for that userId");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),
  body("bed").custom(async (bedId: any) => {
    try {
      const bed = await Bed.findById(bedId);
      if (!bed) {
        return Promise.reject("bed not found");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),
  body("role").isIn(Object.values(StaffRoles)),
  
];
