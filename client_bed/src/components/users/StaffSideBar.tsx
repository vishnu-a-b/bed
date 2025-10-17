import React, { useEffect, useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import {
  Bed,
  User,
} from "lucide-react";
import { AustraliaFlag, IndiaFlag } from "../icons/FlagIcons";

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
];
export default function StaffSideBar() {

  return (
      <AppSidebar  rol={rol} items={items} />
  );
}
