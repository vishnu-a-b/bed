import { calculateAge } from "@/utils/calculateAge";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import UpdatePasswordForm from "./ChangePassword";
import toastService from "@/utils/toastService";

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
