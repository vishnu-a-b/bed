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
    url: "bed",
    icon: Hand,
  },
  {
    title: "Supporters",
    url: "supporter",
    icon: CalendarCheck,
  },
  {
    title: "Staff",
    url: "staff",
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

    const loadOrganization = async () => {
      try {
        const organization = await fetchData("organization");
        setData(organization.items);
      } catch (error) {
        console.error("Error loading organization:", error);
      }
    };

    loadOrganization();
  },[]);
  return (
      data&&
      <AppSidebar data={data} rol={rol} items={items} />
  );
}
