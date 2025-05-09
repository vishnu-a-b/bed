import { error } from "console";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import ListFilterData from "../../../interfaces/ListFilterData";
import { Bed } from "../models/Bed";


export default class BedService {
  create = async (bed: any) => {
    return await Bed.create(bed);
  };

  find = async ({ limit, skip, filterQuery, sort }: ListFilterData) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;

    const beds = await Bed.find(filterQuery)
      .populate(["user", "organization", "country"])
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

  findAndGetAttendance = async ({
    limit,
    skip,
    filterQuery,
    sort,
  }: ListFilterData) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;
    let bedData = [];

    const beds: any[] = await Bed.find(filterQuery)
      .populate(["user", "organization", "country"])
      .sort(sort)
      .limit(limit)
      .skip(skip);
    const today = new Date();
    const startOfDay = today;
    const endOfDay = today;
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(23, 59, 59, 999);

    for (const bed of beds) {
      const attendance = await Bed.findOne({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        bed: bed,
      });
      let data = bed;
      data.attendance = attendance;
      bedData.push(data);
    }
    const total = await Bed.countDocuments(filterQuery);
    return {
      total,
      limit,
      skip,
      items: bedData,
    };
  };

  countTotalDocuments = async () => await Bed.countDocuments();

  findOne = async (id: string) => {
    return await Bed.findById(id).populate([
      "user",
      "organization",
      "country",
    ]);
  };

  findOneWithUserId = async (id: string) => {
    const beds = await Bed.find({ user: id })
      .populate(["user",  "organization" , "country"])
      .limit(1);
    if (beds.length < 1)
      throw new NotFoundError({ error: "Bed not found" });
    return beds[0];
  };

  update = async ({ id, bed }: any) => {
    return await Bed.findByIdAndUpdate(id, bed);
  };

  delete = async (id: any) => {
    return await Bed.findByIdAndDelete(id);
  };
}
