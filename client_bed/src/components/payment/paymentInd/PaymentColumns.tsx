import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import { formatDate1 } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

export interface Payment {
  _id: string;
  amount: number;
  status: string;
  paymentMode: string;
  supporter: {
    _id: any;
    name: string;
  };
  bed: {
    bedNo: string;
  };
  paymentDate?: string;
  razorpay_payment_id?: string;
  transactionReference?: string;
}

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "supporter.name",
    header: "Supporter",
  },
  {
    accessorKey: "bed.bedNo",
    header: "Bed No",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "captured"
              ? "bg-green-100 text-green-800"
              : status === "failed"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "paymentMode",
    header: "Mode",
    cell: ({ row }) => {
      const mode = row.getValue("paymentMode") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            mode === "online"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </span>
      );
    },
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
          <DialogContent className="p-6 max-w-md">
            <ViewDetails data={data} />
          </DialogContent>
        </Dialog>
      );
    },
  },
];

const ViewDetails = ({ data }: { data: Payment }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-gray-500">Supporter</p>
            <p>{data.supporter.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bed No</p>
            <p>{data.bed.bedNo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p>{formatCurrency(data.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="capitalize">{data.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Mode</p>
            <p className="capitalize">{data.paymentMode}</p>
          </div>
          {data.paymentDate && (
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p>{formatDate1(data.paymentDate)}</p>
            </div>
          )}
          {data.paymentMode === "online" && data.razorpay_payment_id && (
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Razorpay ID</p>
              <p className="text-xs font-mono">{data.razorpay_payment_id}</p>
            </div>
          )}
          {data.paymentMode === "offline" && data.transactionReference && (
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Reference</p>
              <p>{data.transactionReference}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          className="text-sm"
          onClick={() => {
            dispatch(setUpdateUrl("payment"));
            dispatch(setUpdateId(data._id));
          }}
        >
          Edit Payment
        </Button>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => router.push(`/supporters/${data.supporter._id}`)}
        >
          View Supporter
        </Button>
      </div>
    </div>
  );
};