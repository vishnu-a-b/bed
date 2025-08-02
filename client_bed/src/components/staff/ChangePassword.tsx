import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toastService from "@/utils/toastService";
import { update } from "@/utils/api/updateData";
import { fetchSingleData } from "@/utils/api/fetchData";


// Define the schema for the password update form
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[\W_]/, {
        message: "Password must contain at least one special character",
      }),

  })


type PasswordFormData = z.infer<typeof passwordSchema>;

const UpdatePasswordForm = ({ staffId }: { staffId: string }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const items: any = await fetchSingleData(staffId, "staff");
      const staffData = items.items;
      const userId: string = staffData.user._id;
      const response = await update(
        { password: data.password },
        "user",
        userId,
        true
      );

      if (response._id) {
        toastService.success("Password updated successfully");
      } else {
        setError("password", { message: "Error updating password" });
        toastService.error("Error updating password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toastService.error("Error updating password");
    }
  };

  return (
    
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          <div>
            <Label htmlFor="password" className="required">
              New Password
            </Label>
            <Input
              id="password"
              {...register("password")}
              placeholder="Enter new password"
              type="text"
              className={`w-full ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          

          <div className="flex justify-end">
            <Button type="submit">Update Password</Button>
          </div>
        </form>
     
  );
};

export default UpdatePasswordForm;