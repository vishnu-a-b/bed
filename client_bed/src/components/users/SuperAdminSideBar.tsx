import React, { useEffect, useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import {
  Settings,
  Building2,
  Flag,
  Bed,
  User,
  PhoneCall,
} from "lucide-react";
import { fetchData } from "@/utils/api/fetchData";
import { AustraliaFlag, IndiaFlag } from "../icons/FlagIcons";

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
    title: "Bed Payments AU",
    url: "payment",
    icon: AustraliaFlag,
  },
  {
    title: "Bed Payments IND",
    url: "payment_ind",
    icon: IndiaFlag,
  },
  {
    title: "General Contribution AU",
    url: "gc_au",
    icon: AustraliaFlag,
  },
  {
    title: "General Contribution IND",
    url: "gc_ind",
    icon: IndiaFlag,
  },
  {
    title: "Follow Up",
    url: "follow_up",
    icon: PhoneCall,
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
