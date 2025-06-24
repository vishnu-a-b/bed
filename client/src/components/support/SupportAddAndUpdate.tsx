import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toastService from "@/utils/toastService";
import { fetchBed, fetchRole, fetchSingleData } from "@/utils/api/fetchData";
import Select, { MultiValue } from "react-select";
import { update } from "@/utils/api/updateData";
import { create } from "@/utils/api/create";
import AsyncSelect from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import { genderOptions } from "@/constants/selectOptions";
import { clearUpdate } from "@/lib/slice/updateSlice";
import { deleteData } from "@/utils/api/delete";
import { RoleOption } from "@/types/api.interface";
import { add } from "lodash";

const supporterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  mobileNo: z.string().min(1, { message: "Mobile number is required" }).max(20),
  password: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Invalid email format",
    }),
  address: z.string().optional(),
  role: z.string().optional(),
  userId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  type: z.string().default("Individual"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  amount: z.number().optional(),
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
  bed: z.string().optional(),
  isActive: z.boolean().default(true),

  /** ✅ New fields */
  nameVisible: z.boolean().optional(),
  panNo: z.string().optional(),
});

type SupporterFormData = z.infer<typeof supporterSchema>;

const SupporterForm = ({ supporterId }: { supporterId?: string }) => {
  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  const dispatch = useDispatch();
  const [bed, setBed] = useState<any>();
  const [gender, setGender] = useState<any>({ value: "Male", label: "Male" });
  const [maritalStatus, setMaritalStatus] = useState<any>({
    value: "Unknown",
    label: "Unknown",
  });
  const [type, setType] = useState<any>({
    value: "Individual",
    label: "Individual",
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
    watch,
  } = useForm<SupporterFormData>({
    resolver: zodResolver(supporterSchema),
  });

  const [isSending, setIsSending] = useState(false);

  const rol = "supporter";
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
    if (supporterId) {
      const fetchDetails = async () => {
        try {
          const items: any = await fetchSingleData(supporterId, "supporter");
          console.log(items);
          const data = items.items;
          console.log(data.user?.isActive);
          setValue("name", data.name);
          setValue("address", data.address || "");
          setValue("mobileNo", data.user?.mobileNo);
          setValue("email", data.user?.email);
          setValue("amount", data.amount);
          setValue("type", data.type);
          setValue("panNo", data.panNo || "");
          setValue("nameVisible", data.nameVisible !== undefined ? data.nameVisible : true);

          setType({
            value: data.type,
            label: data.type,
          });

          if (data.user?.dateOfBirth) {
            const formattedDate = new Date(data.user.dateOfBirth)
              .toISOString()
              .split("T")[0];
            setValue("dateOfBirth", formattedDate);
          }
          if (data.user?.startDate) {
            const formattedDate = new Date(data.user.startDate)
              .toISOString()
              .split("T")[0];
            setValue("startDate", formattedDate);
          }
          if (data.user?.endDate) {
            const formattedDate = new Date(data.user.endDate)
              .toISOString()
              .split("T")[0];
            setValue("endDate", formattedDate);
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
          setBed({
            label: data?.bed?.bedNo,
            id: data?.bed?._id,
          });

          setValue("userId", data.user?._id);
          setValue("role", data.user?.role);
          setValue("isActive", data.isActive);
        } catch (error) {
          console.error("Error fetching supporter details:", error);
        }
      };
      fetchDetails();
    }
  }, [supporterId, setValue]);

  const handleStatusChange = (selectedOption: any) => {
    setIsActiveStatus(selectedOption);
    setValue("isActive", selectedOption.value);
  };
  const onSubmit = async (data: any, event: any) => {
    console.log(roles);
    setIsSending(true);
    event?.preventDefault();
    try {
      // Extract files

      const password = "User@" + data.mobileNo;
      const userData: any = {
        ...(data.name && { name: data.name }),
        ...(data.mobileNo && { mobileNo: data.mobileNo }),
        ...(data.email && { email: data.email }),
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(gender && { gender: gender.value }),
        ...(maritalStatus && { maritalStatus: maritalStatus.value }),

        isActive: data.isActive,
        ...(supporterId ? {} : { password }), // Include password only if creating a new user
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
        formData.append(`roles[${index}]`, "6821c34384fe6b2ba4e1cd14")
      );
      console.log(userData);
      if (supporterId) {
        const responseUser = await update(formData, "user", data.userId || "");
        const supporterData: any = {
          ...(data.name && { name: data.name }),
          ...(bed.id && { bed: bed.id }),
          ...(data.userId && { user: data.userId }),
          ...(data.startDate && { startDate: data.startDate }),
          ...(data.endDate && { endDate: data.endDate }),
          ...(data.amount && { amount: data.amount }),
          ...(data.address && { address: data.address }),
          ...(type.value && { type: type.value }),
          ...(data.nameVisible !== undefined && {
            nameVisible: data.nameVisible,
          }),
          ...(data.panNo && { panNo: data.panNo }),

          isActive: data.isActive,
          role: "regular-supporter",
        };

        const response = await update(supporterData, "supporter", supporterId);
        if (response._id) {
          if (responseUser._id) {
            toastService.success("supporter updated successfully");
          } else {
            setError(responseUser.id, { message: responseUser.value });
            toastService.error("Error updating supporter");
          }
        } else {
          setError(response.id, { message: response.value });
          toastService.error("Error updating supporter");
        }
      } else {
        const response1 = await create("user", formData, true);

        if (response1._id) {
          const supporterData: any = {
            ...(data.name && { name: data.name }),
            ...(bed.id && { bed: bed.id }),
            ...(data.startDate && { startDate: data.startDate }),
            ...(data.endDate && { endDate: data.endDate }),
            ...(data.amount && { amount: data.amount }),
            ...(data.supporterRole && { role: data.supporterRole }),
            ...(type.value && { type: type.value }),
            ...(data.address && { address: data.address }),
            ...(data.nameVisible !== undefined && {
              nameVisible: data.nameVisible,
            }),
            ...(data.panNo && { panNo: data.panNo }),

            isActive: data.isActive,
            user: response1._id,
            role: "regular-supporter",
          };
          const response = await create("supporter", supporterData);
          if (response._id) {
            toastService.success("Supporter created successfully");
            clear();
          } else {
            deleteData("/user", response1._id);
            setError(response.id, { message: response1.value });
            toastService.error("Error creating supporter");
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
  const handleBedChange = (selectedOption: any) => {
    setBed(selectedOption);
  };

  const clear = () => {
    setValue("name", "");
    setValue("mobileNo", "");
    setValue("email", "");
    setValue("dateOfBirth", undefined);
    setValue("startDate", undefined);
    setValue("endDate", undefined);
    dispatch(clearUpdate());
  };

  const loadBedOptions = async (inputValue: string) => {
    const response = await fetchBed(inputValue);
    const data: any[] = response.items;

    return data.map((bed: any) => ({
      id: bed._id,
      label: bed.bedNo,
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
      <div className="col-span-1 lg:col-span-2">
        <Label htmlFor="address" className="required">
          Address
        </Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Enter address"
          className={`w-full ${errors.address ? "border-red-500" : ""}`}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address.message}</p>
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
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          type="date"
          id="startDate"
          {...register("startDate", { valueAsDate: false })}
        />
        {errors.startDate && (
          <p className="text-red-500 text-sm">{errors.startDate.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input
          type="date"
          id="endDate"
          {...register("endDate", { valueAsDate: false })}
        />
        {errors.endDate && (
          <p className="text-red-500 text-sm">{errors.endDate.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          type="number"
          id="amount"
          {...register("amount", { valueAsNumber: true })}
          placeholder="Enter amount"
          className={`w-full ${errors.amount ? "border-red-500" : ""}`}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm">{errors.amount.message}</p>
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
        <Label htmlFor="bed" className="required">
          bed
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadBedOptions}
          defaultOptions
          value={bed}
          onChange={handleBedChange}
          classNamePrefix="select"
          required
          isClearable
        />
        {errors.bed && (
          <p className="text-red-500 text-sm">{errors.bed.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="panNo">PAN Number</Label>
        <Input
          id="panNo"
          {...register("panNo")}
          placeholder="Enter PAN number"
          className="w-full"
        />
        {errors.panNo && (
          <p className="text-red-500 text-sm">{errors.panNo.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="nameVisible">Display Name Publicly</Label>
        <Select
          id="nameVisible"
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
          value={
            watch("nameVisible") !== undefined
              ? {
                  value: watch("nameVisible"),
                  label: watch("nameVisible") ? "Yes" : "No",
                }
              : undefined
          }
          onChange={(selectedOption) =>
            setValue("nameVisible", selectedOption?.value)
          }
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          id="type"
          name="type"
          options={[
            { value: "Individual", label: "Individual" },
            { value: "Organization", label: "Organization" },
          ]}
          classNamePrefix="select"
          defaultValue={{ value: "Individual", label: "Individual" }}
          onChange={(selectedOption: any) => {
            setValue("type", selectedOption?.value);
            setType(selectedOption);
          }}
        />
        {errors.type && (
          <p className="text-red-500 text-sm">{errors.type.message}</p>
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
          {supporterId ? "Cancel" : "Clear"}
        </Button>
        <Button
          className={isSending ? "cursor-not-allowed opacity-50" : ""}
          type="submit"
        >
          {supporterId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default SupporterForm;
