import { calculateAge } from "@/utils/calculateAge";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import UpdatePasswordForm from "./ChangePassword";

export interface Employee {
  name: string;
  user: {
    mobileNo: string;
    dateOfBirth: string;
  };
  role: string;
}

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "user.mobileNo",
    header: "Phone No",
  },
  {
    accessorKey: "user.dateOfBirth",
    header: "Age",
    cell: (row) =>
      row.row.original.user?.dateOfBirth
        ? calculateAge(row.row.original.user.dateOfBirth)
        : "N/A",
  },
  {
    accessorKey: "viewDetails",
    header: "View Details",
    cell: (row) => {
      const data = row.row.original;
      return (
        <Dialog>
          <DialogTrigger className=" underline">
            <button className="px-4 p-1 text-white bg-sidebar-primary rounded-full">View</button>
          </DialogTrigger>
          <DialogContent className="p-6">
            <ViewDetails data={data} />
          </DialogContent>
        </Dialog>
      );
    },
  },
];

const ViewDetails = ({ data }: { data: any }) => {
  console.log(data);
  const dispatch = useDispatch();
  const router = useRouter();
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-2">
        
        <p>
          <strong>{data.name}</strong>
          <br />
          <p>
            Age :
            {data.user.dateOfBirth
              ? calculateAge(data.user.dateOfBirth)
              : "N/A"}
          </p>
          <br />
          Phone No : {data?.user?.mobileNo}
          <br />
          Email : {data?.user?.email}
        </p>
      </div>
     
      <div className="flex gap-2">
        
        <Button
          className=" text-sm"
          onClick={(e) => {
            dispatch(setUpdateUrl("staff"));
            dispatch(setUpdateId(data._id));
          }}
        >
          Edit
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-sm">Change Password</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <UpdatePasswordForm staffId={data._id} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
