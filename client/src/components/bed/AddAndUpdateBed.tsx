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

// Zod schema for validation
const bedSchema = z.object({
  bedNo: z.number().min(1, "Bed number must be at least 1"),
  maxNoContributer: z.number().min(1).max(100),
  amount: z.number().min(0),
  patientName: z.string().optional(),
  vcLink: z.string().url().optional().or(z.literal("")),
});

// Infer form type from Zod schema
type BedFormData = z.infer<typeof bedSchema>;

const AddAndUpdateBed = ({ bedId }: { bedId?: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [head, setHead] = useState<any>();
  const [organization, setOrganization] = useState<any>();
  const [country, setCountry] = useState<any>();
  const [isSending, setIsSending] = useState(false);
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
      maxNoContributer: 15,
      amount: 0,
    }
  });

  useEffect(() => {
    if (bedId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const items: any = await fetchSingleData(bedId, "bed");
          const data = items.items;
          
          setValue("bedNo", data.bedNo);
          setValue("maxNoContributer", data.maxNoContributer);
          setValue("amount", data.amount);
          setValue("patientName", data.patientName || "");
          setValue("vcLink", data.vcLink || "");

          if (data.organization) {
            const orgItems: any = await fetchSingleData(data.organization, "organization");
            setOrganization({ value: data.organization, label: orgItems.items.name });
          }

          if (data.country) {
            const countryItems: any = await fetchSingleData(data.country, "country");
            setCountry({ value: data.country, label: countryItems.items.name });
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
   
    setValue("maxNoContributer", 15);
    setValue("amount", 0);
    setValue("patientName", "");
    setValue("vcLink", "");
    setHead(undefined);
    setOrganization(undefined);
    setCountry(undefined);
    dispatch(clearUpdate());
  };

  const handleHeadChange = (selectedOption: any) => {
    setHead(selectedOption);
  };

  const handleOrganizationChange = (selectedOption: any) => {
    setOrganization({ value: selectedOption.id, label: selectedOption.label });
  };

  const handleCountryChange = (selectedOption: any) => {
    setCountry({ value: selectedOption.id, label: selectedOption.label });
  };

  const onSubmit = async (data: BedFormData) => {
    setIsSending(true);
    try {
      const bedData: any = {
        ...data,
        ...(organization && { organization: organization.value }),
        ...(country && { country: country.value }),
        ...(head && { head: head.value }),
      };
      console.log("Submitting form data:", bedData);
      if (bedId) {
        const response = await update("bed", bedId, bedData);
        if (response._id) {
          toastService.success("Bed updated successfully");
          clear();
        } else {
          setError(response.id, { message: response.value });
          toastService.error("An error occurred while submitting the form");
        }
      } else {
        const response = await create("bed", bedData);
        if (response._id) {
          toastService.success("Bed created successfully");
          clear();
        } else {
          setError(response.id, { message: response.value });
          toastService.error("An error occurred while submitting the form");
        }
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
        <Label htmlFor="maxNoContributer" className="required">
          Maximum Contributors
        </Label>
        <Input
          id="maxNoContributer"
          type="number"
          {...register("maxNoContributer", { valueAsNumber: true })}
          className={`w-full border rounded p-2 ${
            errors.maxNoContributer ? "border-red-500" : "border-gray-300"
          } bg-white dark:bg-gray-800 dark:text-white`}
        />
        {errors.maxNoContributer && (
          <p className="text-red-500 text-sm">{errors.maxNoContributer.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount" className="required">
          Minimum Amount ($)
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
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
        <Label htmlFor="patientName">
          Patient Name
        </Label>
        <Input
          id="patientName"
          {...register("patientName")}
          className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <Label htmlFor="vcLink">
          Video Conference Link
        </Label>
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
        <Label htmlFor="head">
          Bed Head/Manager
        </Label>
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