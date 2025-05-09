import { Axios } from "./apiAuth";

export const deleteData = async (url: string, value: string) => {
  try {
    const response = await Axios.delete(`${url}/${value}`);
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error deleting data:", error);
  }
};
