import { Axios } from "./apiAuth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const fetchData = async (apiUrl: string) => {
  try {
    const response = await Axios.get(`/${apiUrl}`);
    const items = response.data.data;
    return {
      items,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      items: [],
    };
  }
};

export const fetchSingleData = async (id: string, apiUrl: string) => {
  try {
    const response = await Axios.get(`/${apiUrl}/${id}`);
    const items = response.data.data;
    return {
      items,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      items: [],
    };
  }
};

export const fetchOrganization = async (searchTerm: any) => {
  const search = searchTerm ? `&search=${searchTerm}` : "";
  const response = await Axios.get(
    `${API_URL}/organization?limit=Infinity&sortBy=updatedAt${search}`
  );
  return response.data.data;
};

export const fetchBed = async (searchTerm: any) => {
  let term= Number(searchTerm);
  console.log("searchTerm", searchTerm, term,typeof term,typeof searchTerm);
  const search = searchTerm ? `&search=${term}` : "";

  const response = await Axios.get(
    `${API_URL}/bed?limit=Infinity&sortBy=updatedAt${search}`
  );
  return response.data.data;
};
export const fetchCountry = async (searchTerm: any) => {
  const search = searchTerm ? `&search=${searchTerm}` : "";
  const response = await Axios.get(
    `${API_URL}/country?limit=Infinity&sortBy=updatedAt${search}`
  );
  return response.data.data;
};
export const fetchSupporter = async (searchTerm?: string) => {
  const search = searchTerm ? `&search=${searchTerm}` : "";
  const response = await Axios.get(
    `${API_URL}/supporter/supporter?limit=Infinity&sortBy=updatedAt${search}`
  );
  return response.data.data;
};
export const fetchDesignation = async (searchTerm: any) => {
  const search = searchTerm ? `&search=${searchTerm}` : "";
  const response = await Axios.get(
    `${API_URL}/designation?limit=Infinity&sortBy=updatedAt${search}`
  );
  return response.data.data;
};

export const fetchDepartment = async (
  searchTerm: any,
  organizationId: string
) => {
  const search = searchTerm ? `&search=${searchTerm}` : "";
  const filter = organizationId ? `organization__eq=${organizationId}&` : "";
  const response = await Axios.get(
    `${API_URL}/department?${filter}limit=Infinity&sortBy=updatedAt${search}`
  );
  return response.data.data;
};

export const fetchStaff = async (searchTerm: any, organizationId: string) => {
  const search = searchTerm ? `&search=${searchTerm}` : "";
  const filter = organizationId ? `organization__eq=${organizationId}&` : "";
  const response = await Axios.get(
    `${API_URL}/staff?${filter}limit=Infinity&sortBy=updatedAt${search}`
  );
  return response.data.data;
};

export const fetchPunchOptions = async (staffId: any, startDate: string) => {
  const response = await Axios.get(
    `${API_URL}/attendance/${staffId}?startDate=${startDate}&endDate=${startDate}&limit=Infinity&sortBy=updatedAt`
  );
  return response.data.data;
};

export const fetchUsers = async (searchTerm: any) => {
  const search = searchTerm ? `&search=${searchTerm}` : "";
  const response = await Axios.get(
    `${API_URL}/user?limit=Infinity&sortBy=updatedAt${search}`
  );
  console.log(response);
  return response.data.data;
};

export const fetchRole = async () => {
  const response = await Axios.get(`${API_URL}/role`);
  return response.data.data;
};

export const fetchTableData: any = async (
  currentPage: number = 0,
  pageSize: number = 10,
  searchTerm: string = "",
  sortOrder: string = "-createdAt",
  apiUrl: string,
  condition: string = ""
) => {
  try {
    const search = searchTerm ? `&search=${searchTerm}` : "";
    const sort = sortOrder ? `&sortBy=${sortOrder}` : "";
    const response = await Axios.get(
      `/${apiUrl}/?${condition}limit=${pageSize}&skip=${currentPage}${search}${sort}`
    );
    console.log(response);
    return {
      items: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      items: [],
    };
  }
};

export const fetchAttendece: any = async (
  currentPage: number = 0,
  pageSize: number = 10,
  searchTerm: string = "",
  sortOrder: string = "-createdAt",
  apiUrl: string,
  condition: string = ""
) => {
  try {
    const search = searchTerm ? `&search=${searchTerm}` : "";
    const sort = sortOrder ? `&sortBy=${sortOrder}` : "";
    const response = await Axios.get(
      `/${apiUrl}?${condition}limit=${pageSize}&skip=${currentPage}${search}${sort}`
    );
    console.log(response);
    return {
      items: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      items: [],
    };
  }
};
