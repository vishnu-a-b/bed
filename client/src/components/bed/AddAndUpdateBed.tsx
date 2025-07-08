import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import toastService from "@/utils/toastService";
import { update } from "@/utils/api/updateData";
import { create } from "@/utils/api/create";
import { fetchSingleData } from "@/utils/api/fetchData";
import { useDispatch, useSelector } from "react-redux";
import { clearUpdate } from "@/lib/slice/updateSlice";
import { loadOrganizationOptions } from "@/utils/api/loadSelectData";
import AsyncSelect from "react-select/async";
import { loadCountryOptions } from "@/utils/api/loadSelectData";
import { loadUsers } from "@/utils/api/loadSelectData";
import { RootState } from "@/lib/store";
import { FileState, MultiImageDropzone } from "../ui/Multi-Image";

// Zod schema for validation
const bedSchema = z.object({
  bedNo: z.number().min(1, "Bed number must be at least 1"),
  fixedAmount: z.string().optional(),
  amount: z.number().min(0),
  patientName: z.string().optional(),
  vcLink: z.string().url().optional().or(z.literal("")),
  qrPhoto: z.string().optional(),
});

// Infer form type from Zod schema
type BedFormData = z.infer<typeof bedSchema>;

const AddAndUpdateBed = ({ bedId }: { bedId?: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [head, setHead] = useState<any>();
  const [organization, setOrganization] = useState<any>();
  const [country, setCountry] = useState<any>();
  const [isSending, setIsSending] = useState(false);
  const [fileStates, setFileStates] = useState<FileState[]>([]);

  const dispatch = useDispatch();

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    setError,
  } = useForm<BedFormData>({
    resolver: zodResolver(bedSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    if (bedId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const items: any = await fetchSingleData(bedId, "bed");
          const data = items.items;

          setValue("bedNo", data.bedNo);
          setValue("fixedAmount", data.fixedAmount);
          setValue("amount", data.amount);
          setValue("patientName", data.patientName || "");
          setValue("vcLink", data.vcLink || "");
          setValue("qrPhoto", data.qrPhoto || "");

          if (data.organization) {
            setOrganization({
              value: data.organization._id,
              label: data.organization.name,
            });
          }

          if (data.country) {
            const countryItems: any = await fetchSingleData(
              data.country,
              "country"
            );
            setCountry({ value: data.country._id, label: data.country.name });
          }

          if (data.head) {
            const userItems: any = await fetchSingleData(data.head, "user");
            setHead({ value: data.head, label: userItems.items.name });
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching bed details:", error);
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [bedId, setValue]);

  const clear = () => {
    setValue("patientName", "");
    setValue("vcLink", "");
    setFileStates([]);
    dispatch(clearUpdate());
  };

  const handleHeadChange = (selectedOption: any) => {
    setHead(selectedOption);
  };

  const handleOrganizationChange = (selectedOption: any) => {
    if (!selectedOption) {
      setOrganization(null);
    } else {
      setOrganization({
        value: selectedOption.id,
        label: selectedOption.label,
      });
    }
  };

  const handleCountryChange = (selectedOption: any) => {
    if (!selectedOption) {
      setCountry(null);
    } else {
      setCountry({ value: selectedOption.id, label: selectedOption.label });
    }
  };

  const onSubmit = async (data: BedFormData) => {
    setIsSending(true);
    try {
      const formData = new FormData();

      formData.append("bedNo", String(data.bedNo));
      if (data.fixedAmount) {
        formData.append("fixedAmount", String(data.fixedAmount));
      }
      formData.append("amount", String(data.amount));
      formData.append("patientName", data.patientName ?? "");
      formData.append("vcLink", data.vcLink ?? "");

      if (organization) formData.append("organization", organization.value);
      if (country) formData.append("country", country.value);
      if (head) formData.append("head", head.value);

      const qrPhoto = fileStates[0]?.file;
      if (qrPhoto) formData.append("qrPhoto", qrPhoto);

      let response;
      if (bedId) {
        response = await update(formData, "bed", bedId, true); // Make sure this uses `multipart/form-data`
      } else {
        response = await create("bed", formData, true); // Make sure this uses `multipart/form-data`
      }

      if (response._id) {
        toastService.success(
          `Bed ${bedId ? "updated" : "created"} successfully`
        );
        clear();
      } else {
        setError(response.id, { message: response.value });
        toastService.error("An error occurred while submitting the form");
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
      toastService.error("An error occurred while submitting the form");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-[70vh]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-4 bg-primary-foreground dark:bg-gray-900 shadow-lg rounded-lg grid grid-cols-1 gap-4"
    >
      <div>
        <Label htmlFor="organization" className="required">
          Organization
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadOrganizationOptions}
          defaultOptions
          value={organization}
          onChange={handleOrganizationChange}
          classNamePrefix="select"
          isClearable
        />
      </div>

      <div>
        <Label htmlFor="country" className="required">
          Country
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadCountryOptions}
          defaultOptions
          value={country}
          onChange={handleCountryChange}
          classNamePrefix="select"
          isClearable
        />
      </div>

      <div>
        <Label htmlFor="bedNo" className="required">
          Bed Number
        </Label>
        <Input
          id="bedNo"
          type="number"
          {...register("bedNo", { valueAsNumber: true })}
          className={`w-full border rounded p-2 ${
            errors.bedNo ? "border-red-500" : "border-gray-300"
          } bg-white dark:bg-gray-800 dark:text-white`}
        />
        {errors.bedNo && (
          <p className="text-red-500 text-sm">{errors.bedNo.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount" className="required">
          Monthly Cost
        </Label>
        <Input
          id="amount"
          type="number"
          {...register("amount", { valueAsNumber: true })}
          className={`w-full border rounded p-2 ${
            errors.amount ? "border-red-500" : "border-gray-300"
          } bg-white dark:bg-gray-800 dark:text-white`}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fixedAmount">Fixed Donation Amount</Label>
        <Input
          id="fixedAmount"
          type="text"
          {...register("fixedAmount")}
          className={`w-full border rounded p-2 ${
            errors.fixedAmount ? "border-red-500" : "border-gray-300"
          } bg-white dark:bg-gray-800 dark:text-white`}
        />
        {errors.fixedAmount && (
          <p className="text-red-500 text-sm">{errors.fixedAmount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="patientName">Patient Name</Label>
        <Input
          id="patientName"
          {...register("patientName")}
          className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <Label htmlFor="vcLink">Video Conference Link</Label>
        <Input
          id="vcLink"
          {...register("vcLink")}
          className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
        />
        {errors.vcLink && (
          <p className="text-red-500 text-sm">{errors.vcLink.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="head">Bed Head/Manager</Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadUsers}
          defaultOptions
          value={head}
          onChange={handleHeadChange}
          classNamePrefix="select"
          isClearable
        />
      </div>

      <div>
        <Label htmlFor="flag">Qr Photo</Label>
        <MultiImageDropzone
          value={fileStates}
          dropzoneOptions={{
            maxFiles: 1, // Only one file for flag
            maxSize: 1024 * 1024 * 5, // 5 MB
            accept: {
              "image/*": [".png", ".jpg", ".jpeg", ".svg"],
            },
          }}
          onChange={setFileStates}
          onFilesAdded={async (addedFiles) => {
            setFileStates([...fileStates, ...addedFiles]);
          }}
        />
        {errors.qrPhoto && (
          <p className="text-red-500 text-sm">{errors.qrPhoto.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={clear} className="bg-slate-400 hover:bg-slate-500">
          {bedId ? "Cancel" : "Clear"}
        </Button>
        <Button
          className={isSending ? "cursor-not-allowed opacity-50" : ""}
          type="submit"
        >
          {bedId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default AddAndUpdateBed;
