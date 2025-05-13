import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { setBedId, setBedData } from "@/lib/slice/bedSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";

export interface Bed {
  _id: string;
  bedNo: number;
  patientName?: string;
  maxNoContributer: number;
  amount: number;
  vcLink?: string;
  organization: {
    name: string;
  };
  country: {
    name: string;
  };
  head: {
    name: string;
  };
}

export const columns: ColumnDef<Bed>[] = [
  {
    accessorKey: "bedNo",
    header: "Bed Number",
  },
  {
    accessorKey: "patientName",
    header: "Patient Name",
    cell: ({ row }) => row.original.patientName || "Available",
  },
  {
    accessorKey: "organization.name",
    header: "Organization",
  },
  {
    accessorKey: "country.name",
    header: "Country",
  },
  {
    accessorKey: "maxNoContributer",
    header: "Max Contributors",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${row.original.amount.toLocaleString()}`,
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

const ViewDetails = ({ data }: { data: Bed }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-sm">
          <span className="text-2xl">🛏️</span>
        </div>
        <div>
          <p className="text-lg font-bold">Bed #{data.bedNo}</p>
          <p>Status: {data.patientName ? "Occupied" : "Available"}</p>
          <p>Patient: {data.patientName || "None"}</p>
          <p>Organization: {data.organization?.name || "N/A"}</p>
          <p>Country: {data.country?.name || "N/A"}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="font-medium">Contributors</p>
          <p>Max: {data.maxNoContributer}</p>
          <p>Amount: ${data.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-medium">Management</p>
          <p>Head: {data.head?.name || "N/A"}</p>
          {data.vcLink && (
            <a href={data.vcLink} target="_blank" className="text-blue-500 hover:underline">
              Video Conference Link
            </a>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap pt-4">
        <Button
          className="text-sm"
          onClick={(e) => {
            e.preventDefault();
            dispatch(setBedId(data._id));
            router.push(`/beds/${data._id}`);
          }}
        >
          View Details
        </Button>
        
        <Button
          className="text-sm"
          onClick={(e) => {
            dispatch(setUpdateUrl("bed"));
            dispatch(setUpdateId(data._id));
          }}
        >
          Edit
        </Button>
        
        {/* <Button
          className="text-sm"
          onClick={(e) => {
            // Add bed-specific actions
            dispatch(setBedData({
              bedId: data._id,
              bedNo: data.bedNo,
              patientName: data.patientName
            }));
            router.push('/beds/assign-patient');
          }}
        >
          {data.patientName ? "Change Patient" : "Assign Patient"}
        </Button> */}
        
        {data.vcLink && (
          <Button
            className="text-sm"
            onClick={() => window.open(data.vcLink, '_blank')}
          >
            Join Meeting
          </Button>
        )}
      </div>
    </div>
  );
};