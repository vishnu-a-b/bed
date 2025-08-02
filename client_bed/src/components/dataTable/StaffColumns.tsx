import { calculateAge } from "@/utils/calculateAge";
import { ColumnDef } from "@tanstack/react-table";

export interface staffInterface {
  _id: string;
  name: string;
  user: {
    email: string;
    mobileNo: string;
    dateOfBirth: string;
  };
}

export const columns: ColumnDef<staffInterface>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },

  {
    accessorKey: "user.mobileNo",
    header: "Phone No",
  },
  {
    accessorKey: "role",
    header: "Designation",
  },
  {
    accessorKey: "user.dateOfBirth",
    header: "Age",
    cell: (row) => {
      return calculateAge(row.row.original.user?.dateOfBirth);
    },
  },
];
