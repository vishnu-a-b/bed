import { Axios } from "./apiAuth";
import { LeaveDetail } from "@/types/api.interface";
const API_URL = process.env.NEXT_PUBLIC_API_URL;


export const getLeave = async (statuses: string[] = ["pending", "approved", "rejected"]) => {
    try {
     
      if (statuses.includes("all")) {
        const response = await Axios.get(`${API_URL}/leave-request?limit=Infinity&sortBy=updatedAt`);
        return response.data.data.items;
      }
  
      
      const promises = statuses.map((status) =>
        Axios.get(`${API_URL}/leave-request?status__eq=${status}&limit=Infinity&sortBy=updatedAt`)
      );
  
      const responses = await Promise.all(promises);
  
      
      const leaveRequests = responses.flatMap((response) => response.data.data.items);
  
      return leaveRequests;
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      throw error; 
    }
  };



  
 export const PutAcceptorReject = async (leaveId :any, data:any) => {
    try {
      const response = await Axios.put(
        `${API_URL}/leave-request/accept-or-reject/${leaveId}`,
        data,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data; 
    } catch (error) {
      console.error("Error in PUT request:", error);
      throw error;
    }
  };
  