import {
  fetchOrganization,
  fetchDesignation,
  fetchUsers,
  fetchCountry,
  fetchBed,
  fetchSupporter,
} from "./fetchData";

export const loadOrganizationOptions = async (inputValue: string) => {
  const response = await fetchOrganization(inputValue);
  const data: any[] = response.items;

  return data.map((busines: any) => ({
    id: busines._id,
    label: busines.name,
  }));
};
export const loadCountryOptions = async (inputValue: string) => {
  const response = await fetchCountry(inputValue);
  const data: any[] = response.items;

  return data.map((busines: any) => ({
    id: busines._id,
    label: busines.name,
  }));
};
export const loadBedOptions = async (inputValue: string) => {
  const response = await fetchBed(inputValue);
  const data: any[] = response.items;

  return data.map((bed: any) => ({
    id: bed._id,
    label: `${bed.bedNo} - ${bed?.organization?.name}`,
  }));
};

export const loadDesignationOptions = async (inputValue: string) => {
  const response = await fetchDesignation(inputValue);
  const data: any[] = response.items;
  return data.map((designation: any) => ({
    id: designation._id,
    label: designation.name,
  }));
};

export const loadUsers = async (inputValue: string) => {
  const response = await fetchUsers(inputValue);
  const data: any[] = response.items;
  return data.map((designation: any) => ({
    value: designation._id,
    label: designation.name,
  }));
};

export const loadSupporter = async (inputValue: string) => {
  const response = await fetchSupporter(inputValue);
  const data: any[] = response.items;
  console.log("supp:",data)
  return data.map((designation: any) => ({
    value: designation._id,
    label: designation.name,
    bed: designation.bed._id,
    bedNo:designation.bed.bedNo
  }));
};
