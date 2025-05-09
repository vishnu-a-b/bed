import ListFilterData from "../../../interfaces/ListFilterData";
import { Country } from "../models/Country";

export default class CountryService {
  create = async (data: any) => {
    return await Country.create(data);
  };

  find = async ({ limit, skip, filterQuery, sort }: ListFilterData) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;

    const countrys = await Country.find(filterQuery)
      .sort(sort)
      .limit(limit)
      .skip(skip);
    const total = await Country.countDocuments(filterQuery);
    return {
      total,
      limit,
      skip,
      items: countrys,
    };
  };

  findOne = async (id: string) => {
    return await Country.findById(id);
  };

  countTotalDocuments = async () => await Country.countDocuments();

  update = async ({ id, data }: any) => {
    return await Country.findByIdAndUpdate(id, data);
  };

  delete = async (id: any) => {
    return await Country.findByIdAndDelete(id);
  };
  filterByHead = async (head: string) => {
    return await Country.find({
      head,
    });
  };
}
