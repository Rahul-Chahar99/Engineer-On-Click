import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const {name,ext} = path.parse(file.originalname);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage:storage });

// If file.originalname is the string "profile-picture.png", then path.parse("profile-picture.png") will return the following object:

// {
//   root: '',
//   dir: '',
//   base: 'profile-picture.png',
//   ext: '.png',  // The extension
//   name: 'profile-picture' // The name without the extension
// }