import React, { useEffect, useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import {
  Settings,
  Building2,
  Flag,
  Bed,
  User,
  HandCoins,

} from "lucide-react";
import { fetchData } from "@/utils/api/fetchData";

const rol = "super-admin";
const items = [
  {
    title: "Organization",
    url: "organization",
    icon: Building2,
  },
  {
    title: "Country",
    url: "country",
    icon: Flag,
  },
  {
    title: "Beds",
    url: "bed",
    icon: Bed,
  },
  {
    title: "Supporters",
    url: "supporter",
    icon: User,
  },
  {
    title: "BedPayments",
    url: "payment",
    icon: HandCoins,
  },
    {
    title: "Genaral Contribution AUD",
    url: "gc_au",
    icon: HandCoins,
  },
  {
    title: "Staff",
    url: "staff",
    icon: User,
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
