import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { refreshTable, setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import { formatDate1 } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import { useState } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { selectUserDetails } from "@/lib/slice/userSlice";
import { getAccessToken } from "@/utils/api/apiAuth";
import toastService from "@/utils/toastService";

// Mock service - replace with your actual API service
const approvePayment = async (paymentId: string, approved: boolean, remarks?: string) => {
  const token= getAccessToken()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bed-payments/${paymentId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ approved, remarks })
  });
  return response.json();
};
const dispatch = useDispatch();
// const toastService = {
//   success: (message: string) => alert(`Success: ${message}`),
//   error: (message: string) => alert(`Error: ${message}`)
// };

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
  {
    accessorKey: "supporter.name",
    header: "Name",
  },
  {
    accessorKey: "supporter.user.mobileNo",
    header: "Phone No",
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
    accessorKey: "supporter.bed.bedNo",
    header: "Bed",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const data = row.original;
      
      // Show approval status for offline payments
      if (data.paymentMode === "offline") {
        if (data.isApproved === true) {
          dispatch(refreshTable());
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Approved
            </span>
          );
          
        } else {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending Approval
            </span>
          );
        }
      }
      
      // Regular status for online payments
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

const PaymentApproval = ({ payment, onApprovalUpdate }: { 
  payment: Payment, 
  onApprovalUpdate: (paymentId: string, approved: boolean) => void 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showRemarks, setShowRemarks] = useState(false);

  const handleApproval = async (approved: boolean) => {
    if (approved === false && !remarks.trim()) {
      setShowRemarks(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await approvePayment(payment._id, approved, remarks);
      console.log(result)
      if (result.success) {
        onApprovalUpdate(payment._id, approved);
        toastService.success(
          `Payment ${approved ? 'approved' : 'rejected'} successfully${
            approved ? '. Receipt email sent to donor.' : ''
          }`
        );
        setShowRemarks(false);
        setRemarks("");
      } else {
        toastService.error('Error processing approval');
      }
    } catch (error) {
      console.error('Error:', error);
      toastService.error('Error processing approval');
    } finally {
      setIsProcessing(false);
    }
  };

  if (payment.paymentMode !== "offline") {
    return null;
  }

  if (payment.isApproved === true) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Payment approved and receipt sent to donor.
          {payment.approvedAt && (
            <span className="block text-xs text-gray-500 mt-1">
              Approved on {formatDate1(payment.approvedAt)}
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (payment.isApproved === false) {
    return (
      <div className="space-y-4 border-t pt-4">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Payment has been rejected.
          </AlertDescription>
        </Alert>

        {showRemarks && (
          <div>
            <Label htmlFor="approval-remarks" className="text-sm font-medium">
              Remarks
            </Label>
            <textarea
              id="approval-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter approval remarks..."
              className="w-full mt-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3">
          {!showRemarks && (
            <Button
              onClick={() => setShowRemarks(true)}
              variant="outline"
              size="sm"
            >
              Add Remarks
            </Button>
          )}

          <Button
            onClick={() => handleApproval(true)}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            {isProcessing ? "Processing..." : "Approve & Send Receipt"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This manual payment is pending approval. Once approved, a receipt will be automatically sent to the donor.
        </AlertDescription>
      </Alert>

      {showRemarks && (
        <div>
          <Label htmlFor="approval-remarks" className="text-sm font-medium">
            Remarks {!showRemarks && "(Required for rejection)"}
          </Label>
          <textarea
            id="approval-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter approval/rejection remarks..."
            className="w-full mt-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>
      )}

      <div className="flex gap-3">
        {!showRemarks && (
          <Button
            onClick={() => setShowRemarks(true)}
            variant="outline"
            size="sm"
          >
            Add Remarks
          </Button>
        )}

        <Button
          onClick={() => handleApproval(true)}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          {isProcessing ? "Processing..." : "Approve & Send Receipt"}
        </Button>

        <Button
          onClick={() => handleApproval(false)}
          disabled={isProcessing}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          {isProcessing ? "Processing..." : "Reject"}
        </Button>
      </div>
    </div>
  );
};

const ViewDetails = ({ data }: { data: Payment }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const userDetails:any = useSelector(selectUserDetails);
  const [paymentData, setPaymentData] = useState(data);

  const handleApprovalUpdate = (paymentId: string, approved: boolean) => {
    // Update local state to reflect the approval change
    setPaymentData(prev => ({
      ...prev,
      isApproved: approved,
      approvedBy: { id: userDetails.id },
      approvedAt: new Date().toISOString(),
      status: approved ? "completed" : "cancelled"
    }));
  };

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
              <p className="font-mono">{paymentData.receiptNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold text-lg">{paymentData.currency || "AUD"} {formatCurrency(paymentData.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="capitalize font-medium">{paymentData.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Mode</p>
              <p className="capitalize">{paymentData.paymentMode || "online"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Date</p>
              <p>{formatDate1(paymentData.paymentDate || paymentData.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source</p>
              <p className="capitalize">{paymentData.source || "website"}</p>
            </div>
          </div>
        </div>

        {/* Payer Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Payer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{paymentData.name || (paymentData.payer?.name ? `${paymentData.payer.name.given_name || ""} ${paymentData.payer.name.surname || ""}`.trim() : "N/A")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{paymentData.email || paymentData.payer?.email_address || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{paymentData.phNo || paymentData.payer?.phone?.phone_number?.national_number || "N/A"}</p>
            </div>
            {paymentData.payer?.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p>
                  {[
                    paymentData.payer.address.address_line_1,
                    paymentData.payer.address.admin_area_2,
                    paymentData.payer.address.admin_area_1,
                    paymentData.payer.address.postal_code,
                    paymentData.payer.address.country_code
                  ].filter(Boolean).join(", ") || paymentData.address || "N/A"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PayPal Information (for online payments) */}
        {paymentData.paymentMode === "online" && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">PayPal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentData.paypal_order_id && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Order ID</p>
                  <p className="text-xs font-mono break-all">{paymentData.paypal_order_id}</p>
                </div>
              )}
              {paymentData.paypal_payment_id && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Payment ID</p>
                  <p className="text-xs font-mono break-all">{paymentData.paypal_payment_id}</p>
                </div>
              )}
              {paymentData.paypal_capture_id && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Capture ID</p>
                  <p className="text-xs font-mono break-all">{paymentData.paypal_capture_id}</p>
                </div>
              )}
              {paymentData.paypal_status && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Status</p>
                  <p className="uppercase">{paymentData.paypal_status}</p>
                </div>
              )}
              {paymentData.paypal_fee && (
                <div>
                  <p className="text-sm text-gray-500">PayPal Fee</p>
                  <p>{paymentData.paypal_fee.currency} {paymentData.paypal_fee.amount || 0}</p>
                </div>
              )}
              {paymentData.net_amount && (
                <div>
                  <p className="text-sm text-gray-500">Net Amount</p>
                  <p className="font-medium">{paymentData.currency} {formatCurrency(paymentData.net_amount)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Payment Information (for offline payments) */}
        {paymentData.paymentMode === "offline" && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Manual Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentData.manualMethod && (
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="capitalize">{paymentData.manualMethod}</p>
                </div>
              )}
              {paymentData.transactionReference && (
                <div>
                  <p className="text-sm text-gray-500">Transaction Reference</p>
                  <p>{paymentData.transactionReference}</p>
                </div>
              )}
              {paymentData.remarks && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Remarks</p>
                  <p>{paymentData.remarks}</p>
                </div>
              )}
              {paymentData.recordedBy && (
                <div>
                  <p className="text-sm text-gray-500">Recorded By</p>
                  <p>{paymentData.recordedBy.name || paymentData.recordedBy.email || "N/A"}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contribution Details */}
        {paymentData.contribution && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Contribution Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="capitalize">{paymentData.contribution.purpose?.replace("_", " ") || "General Donation"}</p>
              </div>
              {paymentData.contribution.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{paymentData.contribution.description}</p>
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
              <p className={paymentData.isApproved ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {paymentData.isApproved === true ? "Yes" : paymentData.isApproved === false ? "No" : "Pending"}
              </p>
            </div>
            {paymentData.approvedBy && (
              <div>
                <p className="text-sm text-gray-500">Approved By</p>
                <p>{paymentData.approvedBy.name || paymentData.approvedBy.email || "N/A"}</p>
              </div>
            )}
            {paymentData.approvedAt && (
              <div>
                <p className="text-sm text-gray-500">Approved At</p>
                <p>{formatDate1(paymentData.approvedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Approval Component - Only for offline payments */}
        <PaymentApproval 
          payment={paymentData} 
          onApprovalUpdate={handleApprovalUpdate}
        />

        {/* Error Details (if any) */}
        {paymentData.error_details && (paymentData.error_details.error_code || paymentData.error_details.error_message) && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-red-800">Error Details</h4>
            <div className="grid grid-cols-1 gap-2">
              {paymentData.error_details.error_code && (
                <div>
                  <p className="text-sm text-gray-500">Error Code</p>
                  <p className="font-mono text-red-600">{paymentData.error_details.error_code}</p>
                </div>
              )}
              {paymentData.error_details.error_message && (
                <div>
                  <p className="text-sm text-gray-500">Error Message</p>
                  <p className="text-red-600">{paymentData.error_details.error_message}</p>
                </div>
              )}
              {paymentData.error_details.debug_id && (
                <div>
                  <p className="text-sm text-gray-500">Debug ID</p>
                  <p className="font-mono text-xs">{paymentData.error_details.debug_id}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentData.createdAt && (
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p>{formatDate1(paymentData.createdAt)}</p>
              </div>
            )}
            {paymentData.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p>{formatDate1(paymentData.updatedAt)}</p>
              </div>
            )}
            {paymentData.ip_address && (
              <div>
                <p className="text-sm text-gray-500">IP Address</p>
                <p className="font-mono text-xs">{paymentData.ip_address}</p>
              </div>
            )}
            {paymentData.user_agent && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">User Agent</p>
                <p className="text-xs break-all">{paymentData.user_agent}</p>
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
            dispatch(setUpdateId(paymentData._id));
          }}
        >
          Edit Payment
        </Button>
      </div>
    </div>
  );
};