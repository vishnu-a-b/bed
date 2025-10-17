import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toastService from "@/utils/toastService";
import {
  fetchCountry,
  fetchRole,
  fetchSingleData,
} from "@/utils/api/fetchData";
import Select, { MultiValue } from "react-select";
import { update } from "@/utils/api/updateData";
import { create } from "@/utils/api/create";
import AsyncSelect from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { genderOptions } from "@/constants/selectOptions";
import { loadOrganizationOptions } from "@/utils/api/loadSelectData";
import { clearUpdate } from "@/lib/slice/updateSlice";
import { deleteData } from "@/utils/api/delete";
import { RoleOption } from "@/types/api.interface";
import { FileState, MultiImageDropzone } from "../ui/Multi-Image";
import { set } from "lodash";

const staffSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  mobileNo: z.string().min(1, { message: "Mobile number is required" }).max(20),
  password: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Invalid email format",
    }),
  role: z.string().optional(),
  userId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z
    .enum(["Male", "Female", "Other"], {
      message: "Gender is required",
    })
    .optional(),
  maritalStatus: z
    .enum(["Unknown", "Bachelor", "Married", "Divorced", "Widower"], {
      message: "Invalid marital status",
    })
    .optional(),
  country: z.string().optional(),
  organization: z.string().optional(),
  isActive: z.boolean().default(true),
});

type StaffFormData = z.infer<typeof staffSchema>;

const StaffForm = ({ staffId }: { staffId?: string }) => {
  const organizationId: string | null = useSelector(
    (state: RootState) => state.organization.id
  );
  const organizationName: string | null = useSelector(
    (state: RootState) => state.organization.name
  );
  const [organization1, setOrganization1] = useState<any>({
    id: organizationId,
    label: organizationName,
  });
  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];
  
  const dispatch = useDispatch();
  const [country, setCountry] = useState<any>();
  const [gender, setGender] = useState<any>({ value: "Male", label: "Male" });
  const [maritalStatus, setMaritalStatus] = useState<any>({
    value: "Unknown",
    label: "Unknown",
  });

  const [isActiveStatus, setIsActiveStatus] = useState<any>({
    value: true,
    label: "Active",
  });
  
 
  const [roles, setRoles] = useState<MultiValue<RoleOption>>([]);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    setError,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
  });

  
  const [isSending, setIsSending] = useState(false);

  const rol = "staff";
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetchRole();
        const fetchedRoles = response.items.map((item: any) => ({
          value: item._id,
          label: item.title,
          slug: item.slug,
        }));
        const matchedRole = fetchedRoles.find(
          (role: RoleOption) => role.slug === rol
        );
        if (matchedRole) {
          setRoles([matchedRole]);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, [rol]);

  useEffect(() => {
    if (staffId) {
      const fetchDetails = async () => {
        try {
          const items: any = await fetchSingleData(staffId, "staff");
          const data = items.items;
          console.log(data.user?.isActive);
          setValue("name", data.name);
          setValue("mobileNo", data.user?.mobileNo);
          setValue("email", data.user?.email);
          if (data.user?.dateOfBirth) {
            const formattedDate = new Date(data.user.dateOfBirth)
              .toISOString()
              .split("T")[0];
            setValue("dateOfBirth", formattedDate);
          }
          setGender({
            value: data.user?.gender,
            label: data.user?.gender,
          });
          setIsActiveStatus({
            value: data.user?.isActive,
            label: data.user?.isActive ? "Active" : "Inactive",
          });
          
          setMaritalStatus({
            value: data.user?.maritalStatus,
            label: data.user?.maritalStatus,
          });
          setCountry({
            label: data?.country?.name,
            id: data?.country?._id,
          });
          setOrganization1({ label: data?.organization?.name, id: data?.organization?._id });

          setValue("userId", data.user?._id);
          setValue("role", data.user?.role);
          setValue("isActive", data.isActive);
        } catch (error) {
          console.error("Error fetching staff details:", error);
        }
      };
      fetchDetails();
    }
  }, [staffId, setValue]);

  const handleStatusChange = (selectedOption: any) => {
    setIsActiveStatus(selectedOption);
    setValue("isActive", selectedOption.value);
  };
  const onSubmit = async (data: any, event: any) => {
    console.log(roles)
    console.log("Organization:", organization1)
    console.log("Country:", country)
    setIsSending(true);
    event?.preventDefault();

    // Validate required fields before submission
    if (!organization1?.id) {
      toastService.error("Organization is required");
      setIsSending(false);
      return;
    }

    if (!country?.id) {
      toastService.error("Country is required");
      setIsSending(false);
      return;
    }

    try {// Extract files

      const password = "User@" + data.mobileNo;
      const userData: any = {
        ...(data.name && { name: data.name }),
        ...(data.mobileNo && { mobileNo: data.mobileNo }),
        ...(data.email && { email: data.email }),
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(gender && { gender: gender.value }),
        ...(maritalStatus && { maritalStatus: maritalStatus.value }),
        isActive: data.isActive,
        ...(staffId ? {} : { password }), // Include password only if creating a new user
      };

      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((file) => formData.append(key, file)); // Append multiple photos
        } else {
          if (typeof value === "string" || value instanceof Blob) {
            formData.append(key, value);
          } else {
            console.warn(`Skipping key "${key}" with unsupported value type.`);
          }
        }
      });
      roles.forEach((role, index) =>
        formData.append(`roles[${index}]`, role.value)
      );
      console.log(userData);
      if (staffId) {
        const responseUser = await update(
          formData,
          "user",
          data.userId || ""
        );
        const staffData: any = {
          name: data.name,
          organization: organization1.id,
          country: country.id,
          user: data.userId,
          isActive: data.isActive,
          role: "regular-staff",
        };

        const response = await update(staffData, "staff", staffId);
        if (response._id) {
          if (responseUser._id) {
            toastService.success("Staff updated successfully");
          } else {
            setError(responseUser.id, { message: responseUser.value });
            toastService.error("Error updating staff");
          }
        } else {
          setError(response.id, { message: response.value });
          toastService.error("Error updating staff");
        }
      } else {
        const response1 = await create("user", formData);

        if (response1._id) {
            const staffData: any = {
            name: data.name,
            organization: organization1.id,
            country: country.id,
            user: response1._id,
            role: "regular-staff",
            };
          console.log("Creating staff with data:", staffData);
          const response = await create("staff", staffData);
          if (response._id) {
            toastService.success("Staff created successfully");
            clear();
          } else {
            deleteData("/user", response1._id);
            setError(response.id, { message: response1.value });
            toastService.error("Error creating staff");
          }
        } else {
          setError(response1.id, { message: response1.value });
          toastService.error("Error creating user");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toastService.error("Error submitting form");
    } finally {
      setIsSending(false);
    }
  };
  const handleGenderChange = (selectedOption: any) => {
    setValue("gender", selectedOption.value);
    setGender(selectedOption);
  };
  const handleOrganizationChange = (selectedOption: any) => {
    setOrganization1(selectedOption);
  };
  const handleCountryChange = (selectedOption: any) => {
    setCountry(selectedOption);
  };

  const clear = () => {
    setValue("name", "");
    setValue("mobileNo", "");
    setValue("email", "");
    setValue("dateOfBirth", undefined);
    dispatch(clearUpdate());
  };

  const loadCountryOptions = async (inputValue: string) => {
    const response = await fetchCountry(inputValue);
    const data: any[] = response.items;

    return data.map((country: any) => ({
      id: country._id,
      label: country.name,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto  p-4 bg-primary-foreground dark:bg-gray-900 shadow-lg rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <div className="col-span-1 lg:col-span-2">
        <Label htmlFor="name" className="required">
          Name
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter name"
          className={`w-full ${errors.name ? "border-red-500" : ""}`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="mobileNo" className="required">
          Mobile Number
        </Label>
        <Input
          id="mobileNo"
          {...register("mobileNo")}
          placeholder="Enter mobile number"
          className={`w-full ${errors.mobileNo ? "border-red-500" : ""}`}
        />
        {errors.mobileNo && (
          <p className="text-red-500 text-sm">{errors.mobileNo.message}</p>
        )}
      </div>
      <div className="hidden">
        <Label htmlFor="password" className="required">
          Password
        </Label>
        <Input
          id="password"
          {...register("password")}
          placeholder="Enter password"
          type="text"
          className={`w-full ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register("email")}
          placeholder="Enter email"
          className="w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          type="date"
          id="dateOfBirth"
          {...register("dateOfBirth", { valueAsDate: false })}
        />
        {errors.dateOfBirth && (
          <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>
        )}
      </div>

      <div>
        <Label>Gender</Label>
        <Select
          id="gender"
          name="gender"
          value={gender}
          options={genderOptions}
          classNamePrefix="select"
          onChange={handleGenderChange}
        />

        {errors.gender && (
          <p className="text-red-500 text-sm">{errors.gender.message}</p>
        )}
      </div>
      

      <div>
        <Label htmlFor="maritalStatus">Marital Status</Label>
        <Select
          id="maritalStatus"
          name="maritalStatus"
          options={[
            { value: "Unknown", label: "Unknown" },
            { value: "Bachelor", label: "Bachelor" },
            { value: "Married", label: "Married" },
            { value: "Divorced", label: "Divorced" },
            { value: "Widower", label: "Widower" },
          ]}
          classNamePrefix="select"
          value={maritalStatus}
          onChange={(selectedOption: any) => {
            setValue("maritalStatus", selectedOption.value);
            setMaritalStatus(selectedOption);
          }}
        />
        {errors.maritalStatus && (
          <p className="text-red-500 text-sm">{errors.maritalStatus.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="organization" className="required">
        Organization
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadOrganizationOptions}
          defaultOptions
          value={organization1}
          onChange={handleOrganizationChange}
          classNamePrefix="select"
          required
          isClearable
        />

        {errors.organization && (
          <p className="text-red-500 text-sm">{errors.organization.message}</p>
        )}
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
          required
          isClearable
        />
        {errors.country && (
          <p className="text-red-500 text-sm">{errors.country.message}</p>
        )}
      </div>
      
      <div>
        <Label>Status</Label>
        <Select
          options={statusOptions}
          value={isActiveStatus}
          onChange={handleStatusChange}
        />
      </div>

      <div className="flex justify-between col-span-1 lg:col-span-2">
        <Button onClick={clear} className=" bg-slate-400 hover:bg-slate-500">
          {staffId ? "Cancel" : "Clear"}
        </Button>
        <Button
          className={isSending ? "cursor-not-allowed opacity-50" : ""}
          type="submit"
        >
          {staffId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default StaffForm;
