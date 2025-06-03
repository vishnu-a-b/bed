import mongoose from "mongoose";
import ModelFilterInterface from "../../../interfaces/ModelFilterInterface";
import { StaffRoles } from "../../base/enums/staffRoles";
import { User } from "../../user/models/User";
import { StaffTypes } from "../../base/enums/staffTypes";

const staffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, maxLength: 200, required: true },
   
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      required: true,
      maxLength: 20,
      enum: Object.values(StaffRoles),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    salary: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);



export const staffFilterFields: ModelFilterInterface = {
  filterFields: [
    "user",
    "country",
    "organization",
    "isActive",
  ],
  searchFields: ["name"],
  sortFields: ["createdAt", "updatedAt"],
};

export const Staff = mongoose.model("Staff", staffSchema);
