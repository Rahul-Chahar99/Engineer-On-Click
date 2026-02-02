import multer from "multer";
import path from "path";

// Configure storage engine for Multer
// diskStorage stores files on the server's disk (as opposed to memory)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(error, destination_folder) - null for error means success
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Generate a unique suffix using timestamp and random number to prevent filename collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const {name,ext} = path.parse(file.originalname);
    // Construct new filename: originalName-uniqueSuffix.extension
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Export the configured multer instance to be used as middleware in routes
export const upload = multer({ storage:storage });

// If file.originalname is the string "profile-picture.png", then path.parse("profile-picture.png") will return the following object:

// {
//   root: '',
//   dir: '',
//   base: 'profile-picture.png',
//   ext: '.png',  // The extension
//   name: 'profile-picture' // The name without the extension
// }