import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { setCountryId, setCountryName } from "@/lib/slice/countrySlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";

export interface Country {
  _id: string;
  name: string;
  currency: string;
  flag: string;
  organization: {
    name: string;
  };
  head: {
    name: string;
  };
}

export const columns: ColumnDef<Country>[] = [
  {
    accessorKey: "name",
    header: "Country Name",
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "organization.name",
    header: "Organization",
  },
  {
    accessorKey: "head.name",
    header: "Head",
  },
  {
    accessorKey: "viewDetails",
    header: "Actions",
    cell: (row) => {
      const data = row.row.original;
      return (
        <Dialog>
          <DialogTrigger className="underline">
            <button className="px-4 p-1 text-white bg-sidebar-primary rounded-full">
              View
            </button>
          </DialogTrigger>
          <DialogContent className="p-6">
            <ViewDetails data={data} />
          </DialogContent>
        </Dialog>
      );
    },
  },
];

const ViewDetails = ({ data }: { data: Country }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-4">
        {data.flag && (
          <img
            className="w-20 h-fit object-cover rounded-sm"
            crossOrigin="anonymous"
            src={data.flag}
            alt="Country Flag"
          />
        )}
        <div>
          <p className="text-lg font-bold">{data.name}</p>
          <p>Currency: {data.currency}</p>
          <p>Organization: {data.organization?.name || "N/A"}</p>
          <p>Head: {data.head?.name || "N/A"}</p>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button
          className="text-sm"
          onClick={(e) => {
            e.preventDefault();
            dispatch(setCountryId(data._id));
            dispatch(setCountryName(data.name));
            router.push("/admin/country-details");
          }}
        >
          View Details
        </Button>
        
        <Button
          className="text-sm"
          onClick={(e) => {
            dispatch(setUpdateUrl("country"));
            dispatch(setUpdateId(data._id));
          }}
        >
          Edit
        </Button>
        
        <Button
          className="text-sm"
          onClick={(e) => {
            // Add any additional action for country management
          }}
        >
          Manage Regions
        </Button>
      </div>
    </div>
  );
};