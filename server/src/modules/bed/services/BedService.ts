import { error } from "console";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import ListFilterData from "../../../interfaces/ListFilterData";
import { Bed } from "../models/Bed";

export default class BedService {
  create = async (bed: any) => {
    console.log("BedService create", bed);
    try {
      return await Bed.create(bed);
    } catch (error) {
      //console.error("Error creating bed:", error);
      throw new Error("Failed to create bed");
    }
  };

  find = async ({ limit, skip, filterQuery, sort }: ListFilterData) => {
    limit = limit ? limit : 10;
    try {
      console.log(
        "BedService find - raw input:",
        JSON.stringify(filterQuery, null, 2)
      );

      // Deep clone and sanitize the filter query
      const sanitizedFilter = JSON.parse(JSON.stringify(filterQuery || {}));

      // Handle $regex on bedNo by converting to exact match (if possible)
      const sanitizeBedNo = (obj: any) => {
        if (typeof obj !== "object" || obj === null) return;

        for (const key in obj) {
          if (key === "bedNo" && obj[key]?.$regex) {
            // Try to convert regex to number (if it's a simple digit match)
            const regexStr = obj[key].$regex;
            if (/^\d+$/.test(regexStr)) {
              obj[key] = Number(regexStr); // Exact match
            } else {
              delete obj[key]; // Remove if not a pure number
            }
          } else if (key === "$or" && Array.isArray(obj[key])) {
            obj[key] = obj[key]
              .map((condition) => {
                if (condition?.bedNo?.$regex) {
                  const regexStr = condition.bedNo.$regex;
                  if (/^\d+$/.test(regexStr)) {
                    return { ...condition, bedNo: Number(regexStr) };
                  }
                  return {}; // Remove invalid conditions
                }
                return condition;
              })
              .filter((c: any) => Object.keys(c).length > 0);
          } else {
            sanitizeBedNo(obj[key]);
          }
        }
      };

      sanitizeBedNo(sanitizedFilter);

      

      const beds = await Bed.find(sanitizedFilter)
        .populate(["organization", "country", "head"])
        .sort(sort)
        .limit(limit)
        .skip(skip);

      const total = await Bed.countDocuments(sanitizedFilter);

      return {
        total,
        limit,
        skip,
        items: beds,
      };
    } catch (error) {
      console.error("Error finding beds:", error);
      throw new Error("Failed to fetch beds");
    }
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
