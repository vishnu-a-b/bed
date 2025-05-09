import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toastService from "@/utils/toastService";
import { update } from "@/utils/api/updateData";
import { fetchSingleData } from "@/utils/api/fetchData";
import { useState } from "react";
import { FileState, MultiImageDropzone } from "../ui/Multi-Image";

// Define the schema for the password update form
const photoSchema = z.object({
  photos: z.array(z.string().max(200)).optional(),
});

const UpdatePhotoForm = ({ staffId,photos }: { staffId: string, photos: any }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<any>({
    resolver: zodResolver(photoSchema),
  });
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [isSending, setIsSending] = useState(false);
  const onSubmit = async (data: any) => {
    try {
      const items: any = await fetchSingleData(staffId, "staff");
      const staffData = items.items;
      console.log(staffData.user.photos);
      const userId: string = staffData.user._id;
      const photoFiles = fileStates.map((fileState) => fileState.file); // Extract files
      const userData: any = {
        ...(photoFiles.length > 0 && {photos : photoFiles}) // Assign all photos
      }

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
      const response = await update(
        formData,
        "user",
        userId,
        true
      );

      if (response._id) {
        toastService.success("Photos updated successfully");
      } else {
        setError("photos", { message: "Error updating Photos" });
        toastService.error("Error updating password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toastService.error("Error updating password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
      {photos.length >0 && (
        <div>
          <Label htmlFor="photos">Photos used for Punching</Label>
          <div className="flex gap-1">
            {photos.map((item: any, index: any) => (
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
            <p className="text-red-500 text-sm">
              {typeof errors.photos?.message === "string" && errors.photos.message}
            </p>
          )}
        </div>

      <div className="flex justify-end">
        <Button type="submit">Update Password</Button>
      </div>
    </form>
  );
};

export default UpdatePhotoForm;
