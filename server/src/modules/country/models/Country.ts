import mongoose from "mongoose";
import ModelFilterInterface from "../../../interfaces/ModelFilterInterface";

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, maxLength: 200, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    flag: { type: String, maxLength: 200, required: false },
    currency: { type: String, maxLength: 200, required: true },
    address: { 
      type: String, 
      maxLength: 500, 
      required: false 
    },
    phoneNumber: { 
      type: String, 
      maxLength: 50, 
      required: false 
    },
    website: { 
      type: String, 
      maxLength: 200, 
      required: false 
    },
    head: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const countryFilterFields: ModelFilterInterface = {
  filterFields: ["organization", "head"],
  searchFields: ["name"],
  sortFields: ["createdAt", "updatedAt"],
};

export const Country = mongoose.model("Country", countrySchema);
