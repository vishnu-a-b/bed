import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toastService from "@/utils/toastService";
import {
  fetchDepartment,
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
import { loadBusinessOptions } from "@/utils/api/loadSelectData";
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
  photos: z.array(z.string().max(200)).optional(),
  dateOfBirth: z.string().optional(),
  designation: z.string().optional(),
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
  department: z.string().optional(),
  business: z.string().optional(),
  joinDate: z.string().optional(),
  staffType: z.enum(["inside-staff", "outside-staff"]).default("inside-staff"),
  punchType: z.string().optional(),
  salary: z.string().optional(),
  isActive: z.boolean().default(true),
});

type StaffFormData = z.infer<typeof staffSchema>;

const StaffForm = ({ staffId }: { staffId?: string }) => {
  const businessId: string | null = useSelector(
    (state: RootState) => state.business.id
  );
  const businessName: string | null = useSelector(
    (state: RootState) => state.business.name
  );
  const [busines, setBusines] = useState<any>({
    id: businessId,
    label: businessName,
  });
  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];
  const staffTypes = [
    { value: "inside-staff", label: "Inside staff" },
    { value: "outside-staff", label: "Outside staff" },
  ];
  const dispatch = useDispatch();
  const [department, setDepartment] = useState<any>();
  const [gender, setGender] = useState<any>({ value: "Male", label: "Male" });
  const [maritalStatus, setMaritalStatus] = useState<any>({
    value: "Unknown",
    label: "Unknown",
  });

  const [isActiveStatus, setIsActiveStatus] = useState<any>({
    value: true,
    label: "Active",
  });
  const [staffTypeValue, setStaffTypeValue] = useState<any>({
    value: "inside-staff",
    label: "Inside staff",
  });
  const [punchTypeValue, setPunchTypeValue] = useState<any>({
    value: "no-recognition",
    label: "No face recognition",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrl, setPhotoUrl] = useState<any>([]);
  const [photo1Url, setPhoto1Url] = useState<any>();
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

  const [fileStates, setFileStates] = useState<FileState[]>([]);
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
          setPhotoUrl(data.user?.photos);
          setPhoto1Url(data.user?.profilePicture);
          setPhotoFiles(data.user?.photos || []);
          if(data?.salary){
            setValue("salary", parseFloat(data?.salary).toString());
          }
          
          setValue("punchType", data.punchType);
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
          setStaffTypeValue({
            value: data.type,
            label:
              data.type === "inside-staff" ? "Inside staff" : "Outside staff",
          });
          if (data.punchTypeValue) {
            setPunchTypeValue({
              value: data.punchType,
              label:
                data.punchType === "no-recognition"
                  ? "No face recognition"
                  : "Face recognition",
            });
          }
          setValue("staffType", data.type);
          setMaritalStatus({
            value: data.user?.maritalStatus,
            label: data.user?.maritalStatus,
          });
          setDepartment({
            label: data?.department?.name,
            id: data?.department?._id,
          });
          setBusines({ label: data?.business?.name, id: data?.business?._id });
          if (data?.joinDate) {
            const formattedDate = new Date(data.joinDate)
              .toISOString()
              .split("T")[0];
            setValue("joinDate", formattedDate);
          }

          setValue("userId", data.user?._id);
          setValue("role", data.user?.role);
          setValue("designation", data?.designation);
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
    setIsSending(true);
    event?.preventDefault();
    try {
      const photoFiles = fileStates.map((fileState) => fileState.file); // Extract files

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
      console.log(data.salary)
      // Assign photos correctly
      if (photoFiles.length > 0) {
        userData.photos = photoFiles; // Assign all photos
        userData.profilePicture = photoFiles[0]; // First photo as profile picture
      }
      
      if (staffId && photoFiles.length > 0) {
        userData.profilePicture = photoFiles[0]; // Ensure profile picture is assigned in update case
      }

      // Convert userData to FormData for file upload
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
          data.userId || "",
          true
        );
        const staffData: any = {
          ...(data.name && { name: data.name }),
          ...(busines.id && { business: busines.id }),
          ...(department.id && { department: department.id }),
          ...(data.designation && { designation: data.designation }),
          ...(data.joinDate && { joinDate: data.joinDate }),
          ...(data.userId && { user: data.userId }),
          ...(data.staffType && { type: data.staffType }),
          ...(data.salary && { salary: parseFloat(data.salary) }),
          ...(data.punchType && { punchType: data.punchType }),
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
        const response1 = await create("user", formData, true);

        if (response1._id) {
            const staffData: any = {
            ...(data.name && { name: data.name }),
            ...(busines.id && { business: busines.id }),
            ...(department.id && { department: department.id }),
            ...(data.designation && { designation: data.designation }),
            ...(data.staffRole && { role: data.staffRole }),
            ...(data.joinDate && { joinDate: data.joinDate }),
            user: response1._id,
            role: "regular-staff",
            ...(data.staffType && { type: data.staffType }),
            ...(data.salary && { salary: parseFloat(data.salary) }),
            ...(data.punchType && { punchType: data.punchType }),
            };
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
  const handleBusinessChange = (selectedOption: any) => {
    setBusines(selectedOption);
  };
  const handleDepartmentChange = (selectedOption: any) => {
    setDepartment(selectedOption);
  };

  const clear = () => {
    setValue("name", "");
    setValue("mobileNo", "");
    setValue("email", "");
    setPhotoFiles([]);
    setValue("dateOfBirth", undefined);
    setValue("joinDate", undefined);
    dispatch(clearUpdate());
    setValue("photos", []);
  };

  const loadDepartmentOptions = async (inputValue: string) => {
    const response = await fetchDepartment(inputValue, busines.id);
    const data: any[] = response.items;

    return data.map((department: any) => ({
      id: department._id,
      label: department.name,
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
      {photoUrl.length > 0 && (
        <div>
          <Label htmlFor="photos">Photos used for Punching</Label>
          <div className="flex gap-1">
            {photoUrl.map((item: any, index: any) => (
              <img
                className="w-20 h-fit object-cover rounded-sm"
                crossOrigin="anonymous"
                key={index}
                src={item}
                alt="photo"
              />
            ))}
          </div>
        </div>
      )}
      {!staffId ? (
        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="photos">Photos(Minimum add 3 clear images)</Label>

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
      ) : (
        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="profile photo">profile photo</Label>

          <MultiImageDropzone
            value={fileStates}
            dropzoneOptions={{
              maxFiles: 1,
              maxSize: 1024 * 1024 * 5, // 5 MB
            }}
            onChange={setFileStates}
            onFilesAdded={async (addedFiles) => {
              setFileStates([...fileStates, ...addedFiles]);
            }}
          />
        </div>
      )}

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
        <Label htmlFor="business" className="required">
          Business
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadBusinessOptions}
          defaultOptions
          value={busines}
          onChange={handleBusinessChange}
          classNamePrefix="select"
          required
          isDisabled
        />

        {errors.business && (
          <p className="text-red-500 text-sm">{errors.business.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="department" className="required">
          Department
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadDepartmentOptions}
          defaultOptions
          value={department}
          onChange={handleDepartmentChange}
          classNamePrefix="select"
          required
          isClearable
        />
        {errors.department && (
          <p className="text-red-500 text-sm">{errors.department.message}</p>
        )}
      </div>
      {/* <div>
        <Label htmlFor="designation" className="required">
          Designation
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadDesignationOptions}
          defaultOptions
          value={designation}
          onChange={handleDesignationChange}
          classNamePrefix="select"
          required
          isClearable
        />
        {errors.designation && (
          <p className="text-red-500 text-sm">{errors.designation.message}</p>
        )}
      </div> */}
      <div>
        <Label htmlFor="designation">Designation</Label>
        <Input
          id="designation"
          {...register("designation")}
          placeholder="Enter Desiginaton"
          className="w-full"
        ></Input>
        {errors.designation && (
          <p className="text-red-500 text-sm">{errors.designation.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="joinDate" className="required">
          Join Date
        </Label>
        <Input
          type="date"
          id="joinDate"
          {...register("joinDate", { valueAsDate: false })}
        />
        {errors.joinDate && (
          <p className="text-red-500 text-sm">{errors.joinDate.message}</p>
        )}
      </div>
      <div>
        <Label>Staff Type</Label>
        <Select
          options={staffTypes}
          value={staffTypeValue}
          onChange={(selectedOption: any) => {
            setValue("staffType", selectedOption.value);
            setStaffTypeValue(selectedOption);
          }}
        />
        {errors.staffType && (
          <p className="text-red-500 text-sm">{errors.staffType.message}</p>
        )}
      </div>
      <div>
        <Label>Salary</Label>
        <Input
          type="number"
          {...register("salary")}
          placeholder="Enter Salary"
          className={`w-full ${errors.salary ? "border-red-500" : ""}`}
        />
        {errors.salary && (
          <p className="text-red-500 text-sm">{errors.salary.message}</p>
        )}
      </div>
      <div>
        <Label>Punching type</Label>
        <Select
          options={[
            { value: "no-recognition", label: "No face recognition" },
            { value: "recognition", label: "Face recognition" },
          ]}
          value={punchTypeValue}
          onChange={(selectedOption: any) => {
            setValue("punchType", selectedOption.value);
            setPunchTypeValue(selectedOption);
          }}
        />
        {errors.punchType && (
          <p className="text-red-500 text-sm">{errors.punchType.message}</p>
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
