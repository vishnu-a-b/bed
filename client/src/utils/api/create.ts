import { Axios } from "./apiAuth";
const API_URL = process.env.NEXT_PUBLIC_API_URL ;
export const create = async (
    postUrl: string,
    createData: any,
    isFormData = false
  ) => {
    try {
    
      const response = await Axios.post( `${API_URL}/${postUrl}/`,createData, {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      });
      console.log(response);
      return response.data.data;
      
    } catch (error: any) {
      console.error("Error creating data:", error);
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