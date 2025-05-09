import React, { useEffect, useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import {
  Settings,
  SquareUserRound,
  Hand,
  CalendarCheck,
  MapPin,
  IndianRupee,
  FileText,
} from "lucide-react";
import { fetchData } from "@/utils/api/fetchData";

const rol = "super-admin";
const items = [
  {
    title: "Country",
    url: "country",
    icon: SquareUserRound,
  },
  {
    title: "Beds",
    url: "beds",
    icon: Hand,
  },
  {
    title: "Supporters",
    url: "supporters",
    icon: CalendarCheck,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
];
export default function SuperAdminSideBar() {
  const [data, setData] = useState();
  useEffect(() => {

    const loadBusiness = async () => {
      try {
        const business = await fetchData("business");
        setData(business.items);
      } catch (error) {
        console.error("Error loading Business:", error);
      }
    };

    loadBusiness();
  },[]);
  return (
      data&&
      <AppSidebar data={data} rol={rol} items={items} />
  );
}
