import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
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

// Zod schema for validation
const combinedSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }).max(200),
  pinCode: z.string().min(1, { message: "Pin Code is required" }).max(10),
  latitude: z.number({ message: "Expected a Number" }).optional(),
  longitude: z.number({ message: "Expected a Number" }).optional(),
  name: z.string().min(1, { message: "Name is required" }).max(200),
  photos: z.array(z.string().max(200)).optional(),
  vcLink: z.string().max(200).optional(),
  contactMobileNumbers: z.array(z.string().max(20)).optional(),
});

// Infer form type from Zod schema
type CombinedFormData = z.infer<typeof combinedSchema>;

const OrganizationForm = ({ organizationId }: { organizationId?: string }) => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addressId, setAddressId] = useState<string>("");
  const [isUserPopupVisible, setUserPopupVisible] = useState(false);
  const [user, setUser] = useState<any>();
  const dispatch = useDispatch();
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [isSending, setIsSending] = useState(false);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    setError,
  } = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema),
  });

  useEffect(() => {
    if (organizationId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const items: any = await fetchSingleData(organizationId, "organization");
          const data = items.items;
          setAddressId(data.address?._id);
          setValue("name", data.name);
          setValue("address", data.address?.address || "");
          setValue("pinCode", data.address?.pinCode || "");
          setValue("latitude", data.address?.latitude || undefined);
          setValue("longitude", data.address?.longitude || undefined);
          setValue("vcLink", data.vcLink || "");
          setPhoneNumbers(
            data.contactMobileNumbers?.length === 0
              ? [""]
              : data.contactMobileNumbers || [""]
          );
          setPhotoFiles(data.photos || []);
          if (data.admin) {
            const items: any = await fetchSingleData(data.admin, "user");
            console.log(items);
            const data1 = items.items;
            setUser({ value: data.admin, label: data1.name });
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching organization details:", error);
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [organizationId, setValue]);

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };
  const toggleUserPopup = () => {
    setUserPopupVisible(!isUserPopupVisible);
  };
  const removePhoneNumber = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  const clear = () => {
    setPhoneNumbers([""]);
    setPhotoFiles([]);
    setValue("name", "");
    setValue("address", "");
    setValue("pinCode", "");
    setValue("latitude", undefined);
    setValue("longitude", undefined);
    setValue("vcLink", "");
    setUser(undefined);
    dispatch(clearUpdate());
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    const updatedPhoneNumbers = [...phoneNumbers];
    updatedPhoneNumbers[index] = value;
    setPhoneNumbers(updatedPhoneNumbers);
  };

  const handleUserChange = (selectedOption: any) => {
    console.log(selectedOption);
    setUser(selectedOption);
  };


  const onSubmit = async (data: any) => {
    setIsSending(true);
    try {
      const addressData: any = {
        ...(data.address && { address: data.address }),
        ...(data.pinCode && { pinCode: data.pinCode }),
        ...(data.latitude && { latitude: data.latitude }),
        ...(data.longitude && { longitude: data.longitude }),
        taluk: "Unknown",
        district: "Unknown",
      };
      const photoFiles1 = await Promise.all(
        fileStates.map(async (fileState) => {
          if (fileState.file) {
            return fileState.file;
          }
        })
      );
      if (organizationId) {
        // Update logic
        let adressId1 = addressId;
        if (addressId) {
          const addressResponse = await update(
            addressData,
            "address",
            addressId
          );
        } else {
          const addressResponse = await create("address", addressData);
          adressId1 = addressResponse._id;
        }

        console.log(photoFiles1);
        const organizationData: any = {
          ...(data.name && { name: data.name }),
          ...(photoFiles1.length > 0 && { photos: photoFiles1 }),
          ...(data.vcLink && { vcLink: data.vcLink }),
          ...(phoneNumbers.length > 0 && {
            contactMobileNumbers: phoneNumbers,
            address: adressId1,
          }),
          ...(user && { admin: user.value }),
        };
        console.log(organizationData);
        const response = await update(
          organizationData,
          "organization",
          organizationId,
          true
        );
        if (response._id) {
          toastService.success("organization updated successfully");
          clear();
        } else {
          setError(response.id, { message: response.value });
          toastService.error("An error occurred while submitting the form");
        }
      } else {
        // Create logic
        const addressResponse = await create("address", addressData);
        if (addressResponse._id) {
          const organizationData: any = {
            ...(data.name && { name: data.name }),
            ...(addressResponse._id && { address: addressResponse._id }),
            ...(photoFiles.length > 0 && { photos: photoFiles }),
            ...(data.vcLink && { vcLink: data.vcLink }),
            ...(phoneNumbers.length > 0 && {
              contactMobileNumbers: phoneNumbers,
            }),
            ...(user && { admin: user.value }),
          };

          const response = await create("organization", organizationData, true);
          if (response._id) {
            toastService.success("organization created successfully");
            clear();
          } else {
            deleteData("address", addressResponse._id);
            setError(response.id, { message: response.value });
            toastService.error("An error occurred while submitting the form");
          }
        } else {
          setError(addressResponse.id, { message: addressResponse.value });
          toastService.error("An error occurred while submitting the form");
        }
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
      toastService.error("An error occurred while submitting the form");
    }finally{
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
        className="max-w-lg mx-auto p-4 bg-primary-foreground dark:bg-gray-900 shadow-lg rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="name" className="required">
            Name
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter organization name"
            className={`w-full border rounded p-2 ${
              errors.name ? "border-red-500" : "border-gray-300"
            } bg-white dark:bg-gray-800 dark:text-white`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="address" className="required">
            Address
          </Label>
          <Textarea
            id="address"
            {...register("address")}
            placeholder="Enter address"
            className={`w-full border rounded p-2 ${
              errors.address ? "border-red-500" : "border-gray-300"
            } bg-white dark:bg-gray-800 dark:text-white`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="pinCode" className=" required ">
            Pin Code
          </Label>
          <Input
            id="pinCode"
            {...register("pinCode")}
            placeholder="Enter pin code"
            className={`w-full border rounded p-2 ${
              errors.pinCode ? "border-red-500" : "border-gray-300"
            } bg-white dark:bg-gray-800 dark:text-white`}
          />
          {errors.pinCode && (
            <p className="text-red-500 text-sm">{errors.pinCode.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="text"
            step="any"
            {...register("latitude", { valueAsNumber: true })}
            placeholder="Enter latitude"
            className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
          />
          {errors.latitude && (
            <p className="text-red-500 text-sm">{errors.latitude.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="text"
            step="any"
            {...register("longitude", { valueAsNumber: true })}
            placeholder="Enter longitude"
            className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
          />
          {errors.longitude && (
            <p className="text-red-500 text-sm">{errors.longitude.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vcLink">organization Meeting Link</Label>
          <Input
            id="vcLink"
            {...register("vcLink")}
            placeholder="Enter organization Meeting Link"
            className={`w-full border rounded p-2 ${
              errors.vcLink ? "border-red-500" : "border-gray-300"
            } bg-white dark:bg-gray-800 dark:text-white`}
          />
          {errors.vcLink && (
            <p className="text-red-500 text-sm">{errors.vcLink.message}</p>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="admin">Admin</Label>
          <div className=" flex space-x-2 ">
            <AsyncSelect
              cacheOptions
              loadOptions={loadUsers}
              defaultOptions
              value={user}
              onChange={handleUserChange}
              classNamePrefix="select"
              className="flex-1"
              isClearable
            />
            <Button onClick={toggleUserPopup}>+</Button>
          </div>
          {errors.vcLink && (
            <p className="text-red-500 text-sm">{errors.vcLink.message}</p>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="photos">Photos</Label>
          <MultiImageDropzone
            value={fileStates}
            dropzoneOptions={{
              maxFiles: 6,
              maxSize: 1024 * 1024 * 5, // 5 MB
            }}
            onChange={setFileStates}
            onFilesAdded={async (addedFiles) => {
              setFileStates([...fileStates, ...addedFiles]);
            }}
          />
          {errors.photos && (
            <p className="text-red-500 text-sm">{errors.photos.message}</p>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="contactMobileNumbers">Contact Mobile Numbers</Label>
          {phoneNumbers.map((number, index) => (
            <div key={index} className="flex items-center space-x-2 ">
              <Input
                value={number}
                onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                placeholder="Enter mobile number"
                className="flex-1 border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
              />
              {phoneNumbers.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removePhoneNumber(index)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  -
                </Button>
              )}
              {index === phoneNumbers.length - 1 && (
                <Button
                  type="button"
                  onClick={addPhoneNumber}
                  className=" bg-sidebar-accent text-white"
                >
                  +
                </Button>
              )}
            </div>
          ))}
          {errors.contactMobileNumbers && (
            <p className="text-red-500 text-sm">
              {errors.contactMobileNumbers.message}
            </p>
          )}
        </div>

        <div className="flex justify-between col-span-1 lg:col-span-2">
          <Button onClick={clear} className=" bg-slate-400 hover:bg-slate-500">
            {organizationId ? "Cancel" : "Clear"}
          </Button>
          <Button className={isSending ? "cursor-not-allowed opacity-50" : ""} type="submit">{organizationId ? "Update" : "Create"}</Button>
        </div>
      </form>
      {isUserPopupVisible && (
        <UserCreationPopup
          onClose={() => setUserPopupVisible(false)}
          role="6771959e0c2a67fe52bcf45f"
          userSet={setUser}
        />
      )}
    </>
  );
};

export default OrganizationForm;
