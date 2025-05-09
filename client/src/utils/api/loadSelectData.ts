import { fetchBusiness, fetchDepartment, fetchDesignation, fetchUsers } from "./fetchData";

export const loadBusinessOptions = async (inputValue: string) => {
  const response = await fetchBusiness(inputValue);
  const data: any[] = response.items;

  return data.map((busines: any) => ({
    id: busines._id,
    label: busines.name,
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
