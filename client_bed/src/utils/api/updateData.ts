import { Axios } from "./apiAuth";
const API_URL = process.env.NEXT_PUBLIC_API_URL ;
export const update = async (
    updateData: any,
    putUrl: string,
    id: string,
    isFormData = false
  ) => {
    try {
      console.log(typeof(updateData))
      const response = await Axios.put(`${API_URL}/${putUrl}/${id}`, updateData, {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.log(error)
      console.log(error.response.data)
      const response=error.response.data;
      if (response.message === "VALIDATION_FAILED") {
        if (response.error) {
          return({ idNumber: "Identification Details Should be unique" });
        } else if (response.errorsList) {
          return({
            id:response.errorsList[0].path,value: response.errorsList[0].msg,
          });
        }
      } else {
        return({ msg: "Something went wrong" });
      }
    }
  };