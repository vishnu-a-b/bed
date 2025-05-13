import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import ListFilterData from "../../../interfaces/ListFilterData";
import { Bed } from "../../bed/models/Bed";
import { Country } from "../../country/models/Country";
import { Supporter } from "../models/Supporter";

export default class SupporterService {
  create = async (supporter: any) => {
    try {
      return await Supporter.create(supporter);
    } catch (e: any) {
      console.log(e);
    }
  };

  find = async ({ limit, skip, filterQuery, sort }: ListFilterData) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;

    const supporters = await Supporter.find(filterQuery)
      .populate(["user", "bed"])
      .sort(sort)
      .limit(limit)
      .skip(skip);
    const total = await Supporter.countDocuments(filterQuery);
    return {
      total,
      limit,
      skip,
      items: supporters,
    };
  };

  findAllData = async () => {
    // 1. First get correct bed counts per country
    const bedsByCountry = await Bed.aggregate([
      {
        $group: {
          _id: "$country",
          totalBedsInCountry: { $sum: 1 },
          totalAmountOfBed: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "_id",
          foreignField: "_id",
          as: "country",
        },
      },
      { $unwind: "$country" },
      {
        $project: {
          countryName: "$country.name",
          currency: "$country.currency",
          totalBedsInCountry: 1,
          totalAmountOfBed: 1,
        },
      },
    ]);

    // 2. Get supporter amounts per country
    const supportersByCountry = await Supporter.aggregate([
      {
        $lookup: {
          from: "beds",
          localField: "bed",
          foreignField: "_id",
          as: "bed",
        },
      },
      { $unwind: "$bed" },
      {
        $group: {
          _id: "$bed.country",
          totalAmountOfSupporter: { $sum: "$amount" },
        },
      },
    ]);

    // 3. Merge the results
    const result = bedsByCountry.map((country) => {
      const supporterData = supportersByCountry.find(
        (s) => String(s._id) === String(country._id)
      );
      return {
        countryName: country.countryName,
        currency: country.currency,
        totalBedsInCountry: country.totalBedsInCountry, // Now correct
        totalAmountOfSupporter: supporterData?.totalAmountOfSupporter || 0,
        totalAmountOfBed: country.totalAmountOfBed,
      };
    });

    console.log(result);

    return {
      total: 10,
      limit: 10,
      skip: 10,
      items: result,
    };
  };

  countTotalDocuments = async () => await Supporter.countDocuments();

  findOne = async (id: string) => {
    return await Supporter.findById(id).populate(["user", "bed"]);
  };

  findOneWithUserId = async (id: string) => {
    const supporters = await Supporter.find({ user: id })
      .populate(["user", "bed"])
      .limit(1);
    if (supporters.length < 1)
      throw new NotFoundError({ error: "Supporter not found" });
    return supporters[0];
  };

  update = async ({ id, supporter }: any) => {
    return await Supporter.findByIdAndUpdate(id, supporter);
  };

  delete = async (id: any) => {
    return await Supporter.findByIdAndDelete(id);
  };
}
