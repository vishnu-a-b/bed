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
import { useDispatch } from "react-redux";
import { clearUpdate } from "@/lib/slice/updateSlice";
import { deleteData } from "@/utils/api/delete";
import UserCreationPopup from "../staff/AdminAdd";
import { loadUsers } from "@/utils/api/loadSelectData";
import AsyncSelect from "react-select/async";
import { FileState, MultiImageDropzone } from "../ui/Multi-Image";
import { loadOrganizationOptions } from "@/utils/api/loadSelectData";

// Zod schema for validation
const countrySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(200),
  currency: z.string().min(1, { message: "Currency is required" }).max(200),
  flag: z.string().max(200).optional(),
});

// Infer form type from Zod schema
type CountryFormData = z.infer<typeof countrySchema>;

const AddAndUpdateCountry = ({ countryId }: { countryId?: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isUserPopupVisible, setUserPopupVisible] = useState(false);
  const [head, setHead] = useState<any>();
  const [organization, setOrganization] = useState<any>();
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    setError,
  } = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
  });

  useEffect(() => {
    if (countryId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const items: any = await fetchSingleData(countryId, "country");
          const data = items.items;

          setValue("name", data.name);
          setValue("currency", data.currency);
          setValue("flag", data.flag || "");

          if (data.organization) {
            const orgItems: any = await fetchSingleData(
              data.organization,
              "organization"
            );
            const orgData = orgItems.items;
            setOrganization({ value: data.organization, label: orgData.name });
          }

          if (data.head) {
            const userItems: any = await fetchSingleData(data.head, "user");
            const userData = userItems.items;
            setHead({ value: data.head, label: userData.name });
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching country details:", error);
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [countryId, setValue]);

  const toggleUserPopup = () => {
    setUserPopupVisible(!isUserPopupVisible);
  };

  const clear = () => {
    setValue("name", "");
    setValue("currency", "");
    setValue("flag", "");
    setHead(undefined);
    setOrganization(undefined);
    setFileStates([]);
    dispatch(clearUpdate());
  };

  const handleHeadChange = (selectedOption: any) => {
    setHead(selectedOption);
  };

  const handleOrganizationChange = (selectedOption: any) => {
    if (!selectedOption) {
      setOrganization(undefined);
    } else {
      setOrganization({
        value: selectedOption.id,
        label: selectedOption.label,
      });
    }
  };

  const onSubmit = async (data: CountryFormData) => {
    setIsSending(true);
    try {
      const flagFile = fileStates[0]?.file; // Assuming only one file for flag

      if (countryId) {
        // Update logic
        const countryData: any = {
          name: data.name,
          currency: data.currency,
          ...(flagFile && { flag: flagFile }),
          ...(organization && { organization: organization.value }),
          ...(head && { head: head.value }),
        };

        const response = await update(countryData, "country", countryId, true);

        if (response._id) {
          toastService.success("Country updated successfully");
          clear();
        } else {
          setError(response.id, { message: response.value });
          toastService.error("An error occurred while submitting the form");
        }
      } else {
        // Create logic
        const countryData: any = {
          name: data.name,
          currency: data.currency,
          ...(flagFile && { flag: flagFile }),
          ...(organization && { organization: organization.value }),
          ...(head && { head: head.value }),
        };

        const response = await create("country", countryData, true);

        if (response._id) {
          toastService.success("Country created successfully");
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
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg mx-auto p-4 bg-primary-foreground dark:bg-gray-900 shadow-lg rounded-lg grid grid-cols-1 gap-4"
      >
        <div>
          <Label htmlFor="name" className="required">
            Country Name
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter country name"
            className={`w-full border rounded p-2 ${
              errors.name ? "border-red-500" : "border-gray-300"
            } bg-white dark:bg-gray-800 dark:text-white`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="currency" className="required">
            Currency
          </Label>
          <Input
            id="currency"
            {...register("currency")}
            placeholder="Enter currency (e.g., USD, EUR)"
            className={`w-full border rounded p-2 ${
              errors.currency ? "border-red-500" : "border-gray-300"
            } bg-white dark:bg-gray-800 dark:text-white`}
          />
          {errors.currency && (
            <p className="text-red-500 text-sm">{errors.currency.message}</p>
          )}
        </div>

        {/* <div>
          <Label htmlFor="flag">Flag</Label>
          <MultiImageDropzone
            value={fileStates}
            dropzoneOptions={{
              maxFiles: 1, // Only one file for flag
              maxSize: 1024 * 1024 * 5, // 5 MB
              accept: {
                "image/*": [".png", ".jpg", ".jpeg", ".svg"]
              }
            }}
            onChange={setFileStates}
            onFilesAdded={async (addedFiles) => {
              setFileStates([...fileStates, ...addedFiles]);
            }}
          />
          {errors.flag && (
            <p className="text-red-500 text-sm">{errors.flag.message}</p>
          )}
        </div> */}

        <div>
          <Label htmlFor="organization">Organization</Label>
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
          <Label htmlFor="head">Head</Label>
          <div className="flex space-x-2">
            <AsyncSelect
              cacheOptions
              loadOptions={loadUsers}
              defaultOptions
              value={head}
              onChange={handleHeadChange}
              classNamePrefix="select"
              className="flex-1"
              isClearable
            />
            <Button onClick={toggleUserPopup}>+</Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button onClick={clear} className="bg-slate-400 hover:bg-slate-500">
            {countryId ? "Cancel" : "Clear"}
          </Button>
          <Button
            className={isSending ? "cursor-not-allowed opacity-50" : ""}
            type="submit"
          >
            {countryId ? "Update" : "Create"}
          </Button>
        </div>
      </form>

      {isUserPopupVisible && (
        <UserCreationPopup
          onClose={() => setUserPopupVisible(false)}
          role="6771959e0c2a67fe52bcf45f" // You might want to adjust this role ID
          userSet={setHead}
        />
      )}
    </>
  );
};

export default AddAndUpdateCountry;
