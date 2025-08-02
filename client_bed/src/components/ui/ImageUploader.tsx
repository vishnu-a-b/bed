type ImageUploaderProps = {
    onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  
  const ImageUploader = ({ onPhotoUpload }: ImageUploaderProps) => {
    return (
      <input
        id="photos"
        type="file"
        multiple
        onChange={onPhotoUpload}
        className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
      />
    );
  };
  
  export default ImageUploader;
  