import { calculateAge } from "@/utils/calculateAge";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import UpdatePasswordForm from "./ChangePassword";
import toastService from "@/utils/toastService";
import { Axios } from "@/utils/api/apiAuth";
import axios from "axios";

export interface Employee {
  createdAt: string | number | Date;
  _id: string;
  name: string;
  user: {
    mobileNo: string;
    dateOfBirth?: string;
    email?: string;
  };
  bed: {
    vcLink: any;
    bedNo: string;
    organization: {
      name: string;
      vcLink?: string;
    };
    country: {
      currency: string;
    };
  };
  amount: number;
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
    accessorKey: "bed.bedNo",
    header: "Bed",
  },
  {
    accessorKey: "bed.organization.name",
    header: "Organization",
  },
  {
    accessorKey: "data",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const formattedDate = date.toLocaleDateString();
      return formattedDate;
    },
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      return `${row.original.bed?.country?.currency} ${amount}`;
    },
  },

  {
    accessorKey: "viewDetails",
    header: "View Details",
    cell: (row) => {
      const data = row.row.original;
      return (
        <Dialog>
          <DialogTrigger className=" underline">
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

  {
  accessorKey: "sendMessage",
  header: "Send Message",
  cell: ({ row }) => {
    const data = row.original;
    const phoneNumber = data.user?.mobileNo || "";

    const handleSendMessage = () => {
      const message = `Hi Sir, this is volunteer Anjali from Shanthibhavan Palliative Hospital.`;

      let whatsappURL;
      if (phoneNumber) {
        // Mobile-friendly deep link with number
        whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
          message
        )}`;
      } else {
        // Fallback: just message, user chooses contact
        whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
      }

      window.open(whatsappURL, "_blank");
    };

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSendMessage}
        className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
      >
        Send Msg
      </Button>
    );
  },
},

  // {
  //   accessorKey: "sendReminder",
  //   header: "Send Reminder",
  //   cell: ({ row }) => {
  //     const data = row.original;
  //     const org = data.bed?.organization;
  //     const id = data._id;
  //     console.log(data);

  //     // build link exactly like handleCopy
  //     const link =
  //       org?.vcLink && id
  //         ? `${org.vcLink.replace(/\/$/, "")}/supporter?supporter=${id}`
  //         : "";

  //     const handleSend = async () => {
  //       if (!link) {
  //         toastService.error("Link not available.");
  //         return;
  //       }

  //       try {

  //         const API_URL = process.env.NEXT_PUBLIC_API_URL;

  //         // Verify payment with backend
  //         const response = await fetch(
  //           `${API_URL}/bed-payments/payment-followup`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({
  //               name: data.name,
  //               amount: data.amount,
  //               bedNo: String(data.bed?.bedNo || ""), // Convert number to string
  //               supportLink: link,
  //               email: data.user?.email || undefined,
  //               phoneNumber: data.user?.mobileNo || undefined,
  //               vcLink: data.bed.vcLink
  //             }),
  //           }
  //         );

  //         const result:any = response.json();

  //         if (result.success) {
  //           toastService.success("Reminder sent successfully!");
  //         } else {
  //           toastService.error(result.message || "Failed to send reminder.");
  //         }
  //       } catch (error: any) {
  //         console.error("Send reminder error:", error);
  //         toastService.error(
  //           error.response?.data?.message || "Error sending reminder."
  //         );
  //       }
  //     };

  //     return (
  //       <Button variant="outline" size="sm" onClick={handleSend}>
  //         Send
  //       </Button>
  //     );
  //   },
  // },
  // Add this new column to your existing columns array

  {
    accessorKey: "sendWhatsApp",
    header: "Send WhatsApp",
    cell: ({ row }) => {
      const data = row.original;
      const org = data.bed?.organization;
      const id = data._id;

      // Build the supporter link
      const supporterLink =
        org?.vcLink && id
          ? `${org.vcLink.replace(/\/$/, "")}/supporter?supporter=${id}`
          : "";

      const handleWhatsAppSend = async () => {
        if (!supporterLink) {
          toastService.error("Link not available.");
          return;
        }

        // Create dynamic WhatsApp message
        const message = `Dear ${data.name},

On behalf of ${
          org?.name || "Shanthibhavan Palliative Hospital"
        }, heartfelt thanks for your support to our mission. Your monthly donation of ${
          data.bed?.country?.currency || ""
        } ${
          data.amount
        } to the Hands of Grace program helps us provide free palliative hospital care.

Kindly click the link below to access your dashboard and proceed with your contribution:
${supporterLink}

Or pay by bank transfer and notify me:

Account details
BSB: 063-622
Account number: 1141 9379
BIC/SWIFT Code: CTBAAU2S
Account title: SHANTHIBHAVAN PALLIATIVE INTERNATIONAL LTD


Gratefully,
Fr. Joy Koothur
Co-Founder
Shanthibhavan Palliative Hospital`;

        const phoneNumber = data.user?.mobileNo || "";

        const shareData = {
          text: message,
          url: supporterLink,
        };

        // Try using native share if available
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            return;
          } catch (err: any) {
            if (err.name === "AbortError") return;
          }
        }

        // Fallback to WhatsApp Web
        let whatsappURL;
        if (phoneNumber) {
          whatsappURL = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
            message
          )}`;
        } else {
          whatsappURL = `https://web.whatsapp.com/send?text=${encodeURIComponent(
            message
          )}`;
        }

        window.open(whatsappURL, "_blank");
      };

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsAppSend}
          className="bg-green-500 hover:bg-green-600 text-white border-green-500"
        >
          WhatsApp
        </Button>
      );
    },
  },

  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row }) => {
      const org = row.original.bed?.organization;
      const id = row.original._id;
      const link =
        org?.vcLink && id
          ? `${org.vcLink.replace(/\/$/, "")}/supporter?supporter=${id}`
          : "";
      const handleCopy = async () => {
        if (!link) {
          toastService.error("Link not available.");
          return;
        }
        try {
          await navigator.clipboard.writeText(link);
          toastService.success("Link copied to clipboard!");
        } catch (err) {
          toastService.error("Failed to copy link.");
        }
      };

      const handleShare = async () => {
        if (!link) {
          toastService.error("Link not available.");
          return;
        }

        const shareData = {
          title: document.title,
          text: "Check this out!",
          url: link,
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            toastService.error("Sharing failed.");
            console.error("Sharing failed:", err);
          }
        } else {
          const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
            `${shareData.text} ${shareData.url}`
          )}`;
          window.open(whatsappURL, "_blank");
        }
      };

      return (
        <div className="flex flex-col gap-1 max-w-[180px]">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              Copy
            </Button>
            {/* <Button variant="outline" size="sm" onClick={handleShare}>
              Share
            </Button> */}
          </div>
        </div>
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
          Phone No : {data?.user?.mobileNo}
          <br />
          Email : {data?.user?.email}
        </p>
      </div>

      <div className="flex gap-2">
        {/* <Button
          className=" text-sm"
          onClick={(e) => {
            dispatch(setUpdateUrl("supporter"));
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
            <UpdatePasswordForm supporterId={data._id} />
          </DialogContent>
        </Dialog> */}
      </div>
    </div>
  );
};
