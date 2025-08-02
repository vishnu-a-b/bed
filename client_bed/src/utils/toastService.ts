import { toast } from "react-toastify";

const toastService = {
  success: (message: string) => {
    toast.success(message, {
      autoClose: 2000, // Auto close after 5 seconds
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      autoClose: 2000,
    });
  },
  
  info: (message: string) => {
    toast.info(message, {
      autoClose: 2000,
    });
  },

  warning: (message: string) => {
    toast.warning(message, { 
      autoClose: 2000,
    });
  }
};

export default toastService;
