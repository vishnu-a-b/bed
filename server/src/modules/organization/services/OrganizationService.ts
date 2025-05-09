import ListFilterData from "../../../interfaces/ListFilterData";
import { Organization } from "../models/Organization";

export default class OrganizationService {
  create = async (organization: any) => {
    return await Organization.create(organization);
  };

  find = async ({ limit, skip, filterQuery, sort }: ListFilterData) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;

    const organizationes = await Organization.find(filterQuery)
      .sort(sort)
      .limit(limit)
      .skip(skip);
    const total = await Organization.countDocuments(filterQuery);
    return {
      total,
      limit,
      skip,
      items: organizationes,
    };
  };

  findOne = async (id: string) => {
    return await Organization.findById(id).populate(["address"]);
  };

  countTotalDocuments = async () => await Organization.countDocuments();

  update = async ({ id, organization }: any) => {
    return await Organization.findByIdAndUpdate(id, organization);
  };

  delete = async (id: any) => {
    return await Organization.findByIdAndDelete(id);
  };
  filterByAdmin = async (admin: string) => {
    return await Organization.find({
      admin,
    }).populate(["address"]);
  };
}
