"use client";
import { useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setRole,
  selectRole,
  selectIsAuth,
  setIsAuth,
} from "@/lib/slice/authSlice";
import { Axios } from "@/utils/api/apiAuth";
import { setUserDetails } from "@/lib/slice/userSlice";

export const useAuth = (rol: string) => {
  const dispatch = useDispatch();
  const authRole = useSelector(selectRole);
  const isAuth = useSelector(selectIsAuth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setRole(rol));
        const response = await Axios.get(`/account/details`);
        const userData = {
          id: response.data.data._id,
          role: rol,
          name: response.data.data.name,
          photo: response.data.data.photo,
        };
        if (response.data.data.isSuperAdmin && rol === "superAdmin") {
          dispatch(setUserDetails({ ...userData, role: "super-admin" }));
          dispatch(setIsAuth(true));
        } else if (
          response.data.data.roles.some((role: any) => role.slug === rol)
        ) {
          dispatch(setUserDetails(userData));
          dispatch(setIsAuth(true));
        } else {
          dispatch(setRole(rol));
          dispatch(setIsAuth(false));
        } 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const checkAuthentication = async () => {
      const token = localStorage.getItem("refresh_token");
      if (!token) {
        dispatch(setRole(rol));
        dispatch(setIsAuth(false));
      } else {
        fetchData();
      }
    };

    checkAuthentication();
  }, [isAuth, rol, dispatch]);
  return { authRole, isAuth };
};
