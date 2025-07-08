import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { setBedId, setBedData } from "@/lib/slice/bedSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUpdateId, setUpdateUrl } from "@/lib/slice/updateSlice";
import toastService from "@/utils/toastService";

export interface Bed {
  fixedAmount: number;
  _id: string;
  bedNo: number;
  patientName?: string;
  maxNoContributer: number;
  amount: number;
  vcLink?: string;
  organization: {
    name: string;
    vcLink?: string;
  };
  country: {
    name: string;
    currency: string;
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
  // {
  //   accessorKey: "patientName",
  //   header: "Patient Name",
  //   cell: ({ row }) => row.original.patientName || "",
  // },
  // {
  //   accessorKey: "organization.name",
  //   header: "Organization",
  // },
  {
    accessorKey: "country.name",
    header: "Country",
  },
  // {
  //   accessorKey: "maxNoContributer",
  //   header: "Max Contributors",
  // },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      `${
        row.original.country.currency
      } ${row.original.amount.toLocaleString()}`,
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row }) => {
      const org = row.original.organization;
      const id = row.original._id;
      const bedNo = row.original.bedNo || "N/A"; // Add bed number field
      const fixedAmount = row.original.fixedAmount || "No limit"; // Add fixed amount field
      const currency = row.original.country.currency ; // Default to USD if not available
      const link =
        org?.vcLink && id
          ? `${org.vcLink.replace(/\/$/, "")}/bed?bed=${id}`
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
          text: `Bed : ${bedNo}\nMonthly Contribution Amount : ${currency} ${fixedAmount}\n\nClick this link:`, // Customize amount as needed
          url: link,
        };

        // Enhanced sharing options
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err:any) {
            if (err.name !== "AbortError") {
              showShareOptions(shareData);
            }
          }
        } else {
          showShareOptions(shareData);
        }
      };

      const showShareOptions = (shareData:any) => {
        const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;

        // Create a more sophisticated share dialog
        const shouldShare = window.confirm(
          `Share bed details?\n\n${shareData.title}\n${shareData.text}\n\n` +
            `Click OK for WhatsApp or Cancel for other options`
        );

        if (shouldShare) {
          // WhatsApp
          window.open(
            `https://wa.me/?text=${encodeURIComponent(text)}`,
            "_blank"
          );
        } else {
          // Show additional options
          const option = prompt(
            "Choose sharing method:\n\n" +
              "1. Copy to clipboard\n" +
              "2. Email\n" +
              "3. Telegram\n" +
              "Enter option number:"
          );

          switch (option) {
            case "1":
              navigator.clipboard.writeText(text);
              toastService.success("Copied to clipboard!");
              break;
            case "2":
              window.open(
                `mailto:?subject=${encodeURIComponent(
                  shareData.title
                )}&body=${encodeURIComponent(text)}`
              );
              break;
            case "3":
              window.open(
                `https://t.me/share/url?url=${encodeURIComponent(
                  shareData.url
                )}&text=${encodeURIComponent(shareData.text)}`
              );
              break;
            default:
              navigator.clipboard.writeText(text);
              toastService.success("Copied to clipboard!");
          }
        }
      };

      return (
        <div className="flex flex-col gap-1 max-w-[180px]">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              Share
            </Button>
          </div>
         
        </div>
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
          <p>Fixed Amount: {data.fixedAmount}</p>
          <p>Amount: ${data.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-medium">Management</p>
          <p>Head: {data.head?.name || "N/A"}</p>
          {data.vcLink && (
            <a
              href={data.vcLink}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              Video Conference Link
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap pt-4">
        {/* <Button
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
        </Button> */}

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
            onClick={() => window.open(data.vcLink, "_blank")}
          >
            Join Meeting
          </Button>
        )}
      </div>
    </div>
  );
};
