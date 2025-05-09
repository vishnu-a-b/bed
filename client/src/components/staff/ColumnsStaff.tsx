import { calculateAge } from "@/utils/calculateAge";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { setName, setStaffId, setUserName } from "@/lib/slice/staffSlice";
import { changeLink } from "@/lib/slice/LinkSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import UpdatePasswordForm from "./ChangePassword";
import UpdatePhotoForm from "./ChangeRecognition";

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
    accessorKey: "designation",
    header: "Designation",
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
        {data?.user?.photos[0] && (
          <img
            className="w-20 h-fit object-cover rounded-sm"
            crossOrigin="anonymous"
            src={data.user.photos[0]}
            alt="Check-in Photo"
          />
        )}
        <p>
          <strong>{data.name}</strong>
          <br />
          <p>
            Age :
            {data.user.dateOfBirth
              ? calculateAge(data.user.dateOfBirth)
              : "N/A"}
          </p>
          Designation : {data?.role}
          <br />
          Department : {data?.department?.name}
          <br />
          Phone No : {data?.user?.mobileNo}
          <br />
          Email : {data?.user?.email}
        </p>
      </div>
      <p>Address : {data?.user?.address}</p>
      <div className="flex gap-2">
        <Button
          className=" text-sm"
          onClick={(e) => {
            e.preventDefault();
            dispatch(setStaffId(data._id));
            dispatch(setName(data.name));
            dispatch(changeLink("attendance"));
            router.push("/super-admin/attendance");
          }}
        >
          View attendance
        </Button>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-sm">Update Photos</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <UpdatePhotoForm staffId={data._id} photos={data.user?.photos} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
