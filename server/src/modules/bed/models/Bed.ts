import mongoose from "mongoose";
import ModelFilterInterface from "../../../interfaces/ModelFilterInterface";



const bedSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    bedNo: { type: Number },
    maxNoContributer: { type: Number,default:15 },
    amount: { type: Number },
    patientName: { type: String },
    address: { type: String },
    head: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    vcLink: {
      type: String,
    }
  },
  { timestamps: true }
);

export const bedFilterFields: ModelFilterInterface = {
  filterFields: [],
  searchFields: ["bedNo"],
  sortFields: ["bedNo","createdAt", "updatedAt"],
};

export const Bed = mongoose.model("Bed", bedSchema);
