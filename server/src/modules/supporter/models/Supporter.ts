import mongoose from "mongoose";
import ModelFilterInterface from "../../../interfaces/ModelFilterInterface";
import { StaffRoles } from "../../base/enums/staffRoles";
import { User } from "../../user/models/User";


const supporterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, maxLength: 200, required: true },
    panNo: { type: String, maxLength: 20, required: false },
    nameVisible: {
      type: Boolean,
      default: true,
    },
    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    role: {
      type: String,
      required: true,
      maxLength: 20,
      enum: Object.values(StaffRoles),
    },
    type: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    amount: { type: Number },
    verificationStatus: {
      type: String,
    },
    address: {
      type: String,
    }
  },
  { timestamps: true }
);



export const supporterFilterFields: ModelFilterInterface = {
  filterFields: [
    "user",
    "bed",
    "isActive",
  ],
  searchFields: ["name"],
  sortFields: ["createdAt", "updatedAt", "registrationDate"],
};

export const Supporter = mongoose.model("Supporter", supporterSchema);
