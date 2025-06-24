import multer from "multer";

export const multerFileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const multerFileStorageForUserData = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/users/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const multerFileStorageForQr = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/bed/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
