import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  setOrganizationId,
  setOrganizationName,
} from "@/lib/slice/organizationSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";

export interface Organization {
  _id: string;
  name: string;
  management: string;
  // Add other fields as needed
}

export const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Organization Name",
  },
  {
    accessorKey: "management",
    header: "Management",
  },
];
