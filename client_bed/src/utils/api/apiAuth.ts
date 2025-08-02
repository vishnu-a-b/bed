// authService.ts

import { AuthResponse } from "@/types/api.interface";
import axios from "axios";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const loginUser = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/jwt/create`, {
    username,
    password,
  });
  setTokens(response.data.data.accessToken, response.data.data.refreshToken);
  return response.data.data;
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/jwt/verify`, {
    refreshToken: refreshToken,
  });
  return response.data.data;
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  sessionStorage.setItem(`access_token`, accessToken);
  localStorage.setItem(`refresh_token`, refreshToken);
};

export const getAccessToken = () => {
  return sessionStorage.getItem(`access_token`);
};


export const logout = () => {
  
  sessionStorage.removeItem(`access_token`);
  localStorage.removeItem(`refresh_token`);
  window.location.reload();
};


export const Axios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Add an interceptor to include the access token in the headers for every request
Axios.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

// Add an interceptor to handle unauthorized errors and refresh the token
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to unauthorized and the original request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { accessToken } = await refreshAccessToken(refreshToken);
          setTokens(accessToken, refreshToken);
          originalRequest.headers["Authorization"] = "Bearer " + accessToken;
          return Axios(originalRequest);
        } catch (refreshError) {
          // If refresh token is invalid, log the user out
          logout();
          window.location.reload();
          throw refreshError;
        }
      } else {
        // If no refresh token is found, log the user out
        logout();
        window.location.reload();
        throw error;
      }
    }

    throw error;
  }
);

export const fetchTableData = async (
  currentPage: number = 0,
  pageSize: number = 10,
  searchTerm: string = "",
  sortOrder: string = "-updatedAt",
  apiUrl: string,
  condition: string = "",
) => {
  try {
    const search = searchTerm ? `&search=${searchTerm}` : "";
    const sort = sortOrder ? `&sortBy=${sortOrder}` : "";
    const response = await Axios.get(
      `/${apiUrl}/?${condition}limit=${pageSize}&skip=${currentPage}${search}${sort}`
    );
   
    let items =null
   
      items = await Promise.all(
        response.data.data.items
      );

    return {
      items,
      total: response.data.data.total,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      items: [],
      total: 0,
    };
  }
};