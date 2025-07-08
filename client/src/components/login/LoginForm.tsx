// components/LoginForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { selectRole, setIsAuth, setRole } from "@/lib/slice/authSlice";
import { setUserDetails } from "@/lib/slice/userSlice";
import { Axios, loginUser } from "@/utils/api/apiAuth";
import { useAppDispatch } from "@/lib/hooks/redux-hook";
import toastService from "@/utils/toastService";
import { Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";

// Define validation schema using Zod
const loginSchema = z.object({
  userName: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const role = useSelector(selectRole);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      const { isSuperAdmin, roles } = await loginUser(
        data.userName,
        data.password
      );

      const accountResponse = await Axios.get(`/account/details`);
      if (accountResponse.data.success) {
        const userData = {
          id: accountResponse.data.data._id,
          name: accountResponse.data.data.name,
          photo: accountResponse.data.data?.photo,
        };
        console.log("User Data:", userData,roles,role);
        // toastService.success("Successfully Logged In")
        const validRole = roles.some((r) => r.slug === role);
        if ((isSuperAdmin && role === "superAdmin") || validRole) {
          const formattedRole = isSuperAdmin ? "super-admin" : role;
          dispatch(setRole(formattedRole));
          dispatch(setIsAuth(true));
          dispatch(setUserDetails({ ...userData, role: formattedRole }));
          toastService.success("Successfully Logged In");
          // You can keep the user on the same page by not using router.push here
        } else {
          setError("Wrong username or password");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-w-md mx-auto p-6 rounded-lg shadow-lg"
      >
        <div>
          <Label htmlFor="userName">Username</Label>
          <Input
            id="userName"
            type="text"
            placeholder="Enter your username"
            {...register("userName")}
            required
          />
          {errors.userName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.userName.message}
            </p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 text-xl text-gray-500"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
