import mongoose from "mongoose";
import ModelFilterInterface from "../../../interfaces/ModelFilterInterface";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, maxLength: 200, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    photos: [{ type: String, maxLength: 200 }],
    management: {
      type: String,
      maxLength: 200,
      
    },
    contactMobileNumbers: [{ type: String, maxLength: 20, required: false }],
    contactLandlines: [{ type: String, maxLength: 20, required: false }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    vcLink: {
      type: String,
    },
  },
  { timestamps: true }
);

export const organizationFilterFields: ModelFilterInterface = {
  filterFields: ["admin", "management"],
  searchFields: ["name"],
  sortFields: ["createdAt", "updatedAt"],
};

export const Organization = mongoose.model("Organization", organizationSchema);
