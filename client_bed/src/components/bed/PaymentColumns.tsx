import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import { formatDate1 } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

export interface Payment {
  supporter: any;
  _id: string;
  receiptNumber?: string;
  paypal_order_id?: string;
  paypal_payment_id?: string;
  paypal_payer_id?: string;
  paypal_capture_id?: string;
  paypal_order_response?: object;
  paypal_capture_response?: object;
  paypal_refund_response?: object;
  name?: string;
  phNo?: string;
  email?: string;
  address?: string;
  payer?: {
    email_address?: string;
    payer_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
    phone?: {
      phone_type?: string;
      phone_number?: {
        national_number?: string;
      };
    };
    address?: {
      country_code?: string;
      address_line_1?: string;
      admin_area_1?: string;
      admin_area_2?: string;
      postal_code?: string;
    };
  };
  amount: number;
  currency?: string;
  paypal_fee?: {
    amount?: number;
    currency?: string;
  };
  net_amount?: number;
  status: string;
  paypal_status?: string;
  contribution?: {
    purpose?: string;
    description?: string;
  };
  paymentDate?: string;
  paypal_create_time?: string;
  paypal_update_time?: string;
  isApproved?: boolean;
  approvedBy?: any;
  approvedAt?: string;
  paymentMode?: string;
  manualMethod?: string;
  transactionReference?: string;
  remarks?: string;
  recordedBy?: any;
  source?: string;
  error_details?: {
    error_code?: string;
    error_message?: string;
    debug_id?: string;
  };
  notes?: object;
  ip_address?: string;
  user_agent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const paymentColumns: ColumnDef<Payment>[] = [
  // {
  //   accessorKey: "receiptNumber",
  //   header: "Receipt No",
  //   cell: ({ row }) => {
  //     const receiptNumber = row.getValue("receiptNumber") as string;
  //     return receiptNumber || "N/A";
  //   },
  // },
  {
    accessorKey: "supporter.name",
    header: "Name",
    
  },
  {
    accessorKey: "phNo",
    header: "Phone No",
    cell: ({ row }) => {
      const data = row.original;
      // return data.supporter.user.phNo || data.payer?.phone || "N/A";
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }:any) => {
      const date = new Date(row?.original?.paymentDate || row?.original?.createdAt);
      const formattedDate = date.toLocaleDateString();
      return formattedDate;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const data = row.original;
      const currency = data.currency || "AUD";
      return `${currency} ${row.getValue("amount")}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "failed"
              ? "bg-red-100 text-red-800"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "cancelled"
              ? "bg-gray-100 text-gray-800"
              : status === "refunded" || status === "partially_refunded"
              ? "bg-orange-100 text-orange-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
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
          {mode?.charAt(0).toUpperCase() + mode?.slice(1) || "Online"}
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
          <DialogContent className="p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
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
    <div className="flex flex-col space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">Payment Details</h3>
        
        {/* Basic Payment Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Basic Information</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Receipt Number</p>
              <p className="font-mono">{data.receiptNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold text-lg">{data.currency || "AUD"} {formatCurrency(data.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="capitalize font-medium">{data.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Mode</p>
              <p className="capitalize">{data.paymentMode || "online"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Date</p>
              <p>{formatDate1(data.paymentDate || data.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source</p>
              <p className="capitalize">{data.source || "website"}</p>
            </div>
          </div>
        </div>

        {/* Payer Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Payer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{data.name || (data.payer?.name ? `${data.payer.name.given_name || ""} ${data.payer.name.surname || ""}`.trim() : "N/A")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{data.email || data.payer?.email_address || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{data.phNo || data.payer?.phone?.phone_number?.national_number || "N/A"}</p>
            </div>
            {data.payer?.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p>
                  {[
                    data.payer.address.address_line_1,
                    data.payer.address.admin_area_2,
                    data.payer.address.admin_area_1,
                    data.payer.address.postal_code,
                    data.payer.address.country_code
                  ].filter(Boolean).join(", ") || data.address || "N/A"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PayPal Information (for online payments) */}
        {data.paymentMode === "online" && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">PayPal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.paypal_order_id && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Order ID</p>
                  <p className="text-xs font-mono break-all">{data.paypal_order_id}</p>
                </div>
              )}
              {data.paypal_payment_id && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Payment ID</p>
                  <p className="text-xs font-mono break-all">{data.paypal_payment_id}</p>
                </div>
              )}
              {data.paypal_capture_id && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Capture ID</p>
                  <p className="text-xs font-mono break-all">{data.paypal_capture_id}</p>
                </div>
              )}
              {data.paypal_status && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Status</p>
                  <p className="uppercase">{data.paypal_status}</p>
                </div>
              )}
              {data.paypal_fee && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Fee</p>
                  <p>{data.paypal_fee.currency} {data.paypal_fee.amount || 0}</p>
                </div>
              )}
              {data.net_amount && (
                <div>
                  <p className="text-sm text-gray-500">Net Amount</p>
                  <p className="font-medium">{data.currency} {formatCurrency(data.net_amount)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Payment Information (for offline payments) */}
        {data.paymentMode === "offline" && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Manual Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.manualMethod && (
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="capitalize">{data.manualMethod}</p>
                </div>
              )}
              {data.transactionReference && (
                <div>
                  <p className="text-sm text-gray-500">Transaction Reference</p>
                  <p>{data.transactionReference}</p>
                </div>
              )}
              {data.remarks && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Remarks</p>
                  <p>{data.remarks}</p>
                </div>
              )}
              {data.recordedBy && (
                <div>
                  <p className="text-sm text-gray-500">Recorded By</p>
                  <p>{data.recordedBy.name || data.recordedBy.email || "N/A"}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contribution Details */}
        {data.contribution && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Contribution Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="capitalize">{data.contribution.purpose?.replace("_", " ") || "General Donation"}</p>
              </div>
              {data.contribution.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{data.contribution.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approval Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Approval Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className={data.isApproved ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {data.isApproved ? "Yes" : "No"}
              </p>
            </div>
            {data.approvedBy && (
              <div>
                <p className="text-sm text-gray-500">Approved By</p>
                <p>{data.approvedBy.name || data.approvedBy.email || "N/A"}</p>
              </div>
            )}
            {data.approvedAt && (
              <div>
                <p className="text-sm text-gray-500">Approved At</p>
                <p>{formatDate1(data.approvedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Details (if any) */}
        {data.error_details && (data.error_details.error_code || data.error_details.error_message) && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-red-800">Error Details</h4>
            <div className="grid grid-cols-1 gap-2">
              {data.error_details.error_code && (
                <div>
                  <p className="text-sm text-gray-500">Error Code</p>
                  <p className="font-mono text-red-600">{data.error_details.error_code}</p>
                </div>
              )}
              {data.error_details.error_message && (
                <div>
                  <p className="text-sm text-gray-500">Error Message</p>
                  <p className="text-red-600">{data.error_details.error_message}</p>
                </div>
              )}
              {data.error_details.debug_id && (
                <div>
                  <p className="text-sm text-gray-500">Debug ID</p>
                  <p className="font-mono text-xs">{data.error_details.debug_id}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.createdAt && (
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p>{formatDate1(data.createdAt)}</p>
              </div>
            )}
            {data.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p>{formatDate1(data.updatedAt)}</p>
              </div>
            )}
            {data.ip_address && (
              <div>
                <p className="text-sm text-gray-500">IP Address</p>
                <p className="font-mono text-xs">{data.ip_address}</p>
              </div>
            )}
            {data.user_agent && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">User Agent</p>
                <p className="text-xs break-all">{data.user_agent}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          className="text-sm"
          onClick={() => {
            dispatch(setUpdateUrl("generous-payments"));
            dispatch(setUpdateId(data._id));
          }}
        >
          Edit Payment
        </Button>
      </div>
    </div>
  );
};