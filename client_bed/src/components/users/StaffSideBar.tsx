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

const rol = "staff";
const items = [
  
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
    title: "Genaral Contribution AUD",
    url: "gc_au",
    icon: HandCoins,
  },
  
];
export default function StaffSideBar() {

  return (
      <AppSidebar  rol={rol} items={items} />
  );
}
