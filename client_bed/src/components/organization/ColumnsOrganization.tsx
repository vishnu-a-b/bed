import { ColumnDef } from "@tanstack/react-table";


export interface Organization {
  _id: string;
  name: string;
  management: string;
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
