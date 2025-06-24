import { error } from "console";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import ListFilterData from "../../../interfaces/ListFilterData";
import { Bed } from "../models/Bed";

export default class BedService {
  create = async (bed: any) => {
    console.log("BedService create", bed);
    try{
      
      return await Bed.create(bed);
    }catch (error) {
      //console.error("Error creating bed:", error);
      throw new Error("Failed to create bed");
    }
    
  };

  find = async ({ limit, skip, filterQuery, sort }: ListFilterData) => {
    limit = limit ? limit : 10;
    const beds = await Bed.find(filterQuery)
      .populate(["organization", "country", "head"])
      .sort(sort)
      .limit(limit)
      .skip(skip);
    const total = await Bed.countDocuments(filterQuery);
    return {
      total,
      limit,
      skip,
      items: beds,
    };
  };

  

  countTotalDocuments = async () => await Bed.countDocuments();

  findOne = async (id: string) => {
    return await Bed.findById(id).populate(["organization", "country"]);
  };

  findOneWithUserId = async (id: string) => {
    const beds = await Bed.find({ user: id })
      .populate(["organization", "country"])
      .limit(1);
    if (beds.length < 1) throw new NotFoundError({ error: "Bed not found" });
    return beds[0];
  };

  update = async ({ id, bed }: any) => {
    return await Bed.findByIdAndUpdate(id, bed);
  };

  delete = async (id: any) => {
    return await Bed.findByIdAndDelete(id);
  };
}
