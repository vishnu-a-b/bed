import mongoose from "mongoose";
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
      .populate([
      "user",
      { 
        path: "bed", 
        populate: [
        { path: "organization" },
        { path: "country" }
        ] 
      }
      ])
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
          countryId: "$country._id",
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
        countryId: country.countryId,
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

  findOneCountryData = async (countryId: string) => {
    // 1. Get basic country info with bed counts
    const countryData = await Bed.aggregate([
      {
        $match: {
          country: new mongoose.Types.ObjectId(countryId),
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country",
        },
      },
      { $unwind: "$country" },
      {
        $group: {
          _id: "$country._id",
          countryId: { $first: "$country._id" },
          countryName: { $first: "$country.name" },
          currency: { $first: "$country.currency" },
          totalBedsInCountry: { $sum: 1 },
          totalAmountOfBed: { $sum: "$amount" },
          beds: { $push: "$_id" }, // Collect all bed IDs
        },
      },
    ]);

    if (countryData.length === 0) {
      throw new Error("Country not found");
    }

    const country = countryData[0];

    // 2. Get supporter amounts for the country
    const supporterData = await Supporter.aggregate([
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
        $match: {
          "bed.country": new mongoose.Types.ObjectId(countryId),
        },
      },
      {
        $group: {
          _id: null,
          totalAmountOfSupporter: { $sum: "$amount" },
        },
      },
    ]);

    // 3. Get detailed bed information with supporter counts
    const bedsWithSupporters = await Bed.aggregate([
      {
        $match: {
          country: new mongoose.Types.ObjectId(countryId),
        },
      },
      {
        $lookup: {
          from: "supporters",
          localField: "_id",
          foreignField: "bed",
          as: "supporters",
        },
      },
      {
        $project: {
          bedNo: "$bedNo",
          bedId: "$_id",
          totalAmountOfTheBed: "$amount",
          totalNoOfSupportersByBed: { $size: "$supporters" },
          totalAmountFromSupporters: { $sum: "$supporters.amount" },
        },
      },
      { $sort: { bedNo: 1 } },
    ]);

    return {
      countryId: country._id,
      countryName: country.countryName,
      currency: country.currency,
      totalBedsInCountry: country.totalBedsInCountry,
      totalAmountOfSupporter: supporterData[0]?.totalAmountOfSupporter || 0,
      totalAmountOfBed: country.totalAmountOfBed,
      beds: bedsWithSupporters.map((bed) => ({
        bedNo: bed.bedNo,
        bedId: bed.bedId,
        totalAmountOfTheBed: bed.totalAmountOfTheBed,
        totalNoOfSupportersByBed: bed.totalNoOfSupportersByBed,
        totalAmountFromSupporters: bed.totalAmountFromSupporters,
      })),
    };
  };

  findOneBedData = async (bedId: string) => {
    // Validate bedId
    if (!bedId || !mongoose.Types.ObjectId.isValid(bedId)) {
      throw new Error("Invalid bed ID");
    }

    // 1. Get basic bed information
    const bedData = await Bed.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(bedId),
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country",
        },
      },
      { $unwind: "$country" },
    ]);

    if (bedData.length === 0) {
      throw new Error("Bed not found");
    }

    const bed = bedData[0];

    // 2. Get all supporters for this bed with their names directly from supporter schema
    const supportersData = await Supporter.aggregate([
      {
        $match: {
          bed: new mongoose.Types.ObjectId(bedId),
        },
      },
      {
        $project: {
          supporterName: {
            $cond: {
              if: { $eq: ["$nameVisible", true] },
              then: "$name",
              else: "Anonymous",
            },
          }, 
          amount: 1,
          createdAt: 1,
          // Include any other supporter fields you need
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by newest first
    ]);

    // 3. Calculate totals (unchanged)
    const totals = await Supporter.aggregate([
      {
        $match: {
          bed: new mongoose.Types.ObjectId(bedId),
        },
      },
      {
        $group: {
          _id: null,
          totalNoOfSupportersByBed: { $sum: 1 },
          totalAmountFromSupporters: { $sum: "$amount" },
        },
      },
    ]);

    return {
      bedNo: bed.bedNo,
      bedId: bed._id,
      countryId: bed.country._id,
      countryName: bed.country.name,
      currency: bed.country.currency,
      totalAmountOfTheBed: bed.amount,
      fixedAmount: bed.fixedAmount,
      totalNoOfSupportersByBed: totals[0]?.totalNoOfSupportersByBed || 0,
      totalAmountFromSupporters: totals[0]?.totalAmountFromSupporters || 0,
      supporters: supportersData.map((supporter) => ({
        supporterName: supporter.supporterName,
        amount: supporter.amount,
        date: supporter.createdAt,
        // Include any other supporter fields you need
      })),
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
