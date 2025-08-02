import React, { use, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import toastService from "@/utils/toastService";
import { create } from "@/utils/api/create";
import { genderOptions } from "@/constants/selectOptions";

const userSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  mobileNo: z.string().min(1, { message: "Mobile number is required" }).max(20),
  email: z.string().email({ message: "Invalid email format" }).optional(),
  photo: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Gender is required",
  }).optional(),
  maritalStatus: z
    .enum(["Unknown", "Bachelor", "Married", "Divorced", "Widower"], {
      message: "Invalid marital status",
    })
    .optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const UserCreationPopup = ({
  onClose,
  role,
  userSet // Add role to props
}: {
  onClose: () => void;
  role?: string;
  userSet: any; // Add optional type for role
}) => {
  console.log(role);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [gender, setGender] = useState<any>({ value: "Male", label: "Male" });
  const [maritalStatus, setMaritalStatus] = useState<any>({ value: "Unknown", label: "Unknown" });

  const onSubmit1 = async (data: UserFormData, event:any) => {
    event.preventDefault();
    console.log(data);
    try {
      const userData: any = {
        ...(data.name && { name: data.name }),
        ...(data.mobileNo && { mobileNo: data.mobileNo }),
        ...(data.email && { email: data.email }),
        ...(photoFile && { photo: photoFile }),
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(gender && { gender: gender.value }),
        ...(maritalStatus && { maritalStatus: maritalStatus.value }),
        ...(data.mobileNo && { password: data.mobileNo }), // Assuming password is derived from mobileNo
        role,
      };
      const response = await create("user", userData, true);
      console.log(response);
      if (response._id) {
        userSet({value:response._id,label:data.name});
        toastService.success("User created successfully");
        onClose();
      } else {
        toastService.error("Error creating user");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toastService.error("Error submitting form");
    }
  };

  const handleGenderChange = (selectedOption: any) => {
    setValue("gender", selectedOption.value);
    setGender(selectedOption);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-x-0 inset-y-[-16px] bg-black bg-opacity-50 flex justify-center items-center z-100 ">
      <div className="p-2  bg-white sm:p-6 rounded-lg shadow-md ">
        <h2 className="text-lg font-semibold mb-4">Create User</h2>
        <form
          
          onSubmit={handleSubmit(onSubmit1)}
          className="grid grid-cols-2 sm:gap-4"
        >
          <div>
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
              <p className="text-red-500 text-sm">
                {errors.dateOfBirth.message}
              </p>
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
              <p className="text-red-500 text-sm">
                {errors.maritalStatus.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              onChange={handlePhotoUpload}
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
            />
            {errors.photo && (
              <p className="text-red-500 text-sm">{errors.photo.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password" className="required">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter password"
              className={`w-full ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          {/* <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              {...register("role")}
              placeholder="Enter role"
              className="w-full"
            />
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div> */}
          <div className=" col-span-2 flex justify-between space-x-2">
            <Button onClick={onClose} className="bg-gray-400 hover:bg-gray-500">
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreationPopup;
