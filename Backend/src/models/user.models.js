import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// we have import Schema that's why no need of writing mongoose.Schema just write Schema
const userSchema = new Schema(
  {
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true, // to unable searching field more optimized
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    fullName: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      default: "",
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 character long"],
      maxlength: [30, "Password can not be more than 30 character long"],
    },
    refreshToken: {
      type: String,
    },
    address: {
      type: String,
      default: "",
    },
    aadharNo: {
      type: String,
      minlength: [12, "Please Enter Correct 12 Digit Aadhar No"],
      maxlength: [12, "Aadhar Number Can't Exceed Limit of 12 Digits"],
      default: "",
    },
    mobileNo: {
      type: String,
      minlength: [10, "Mobile No must be at least 10 digits long"],
      maxlength: [10, "Mobile No  can not be more than 10 Digits"],
      default: "",
    },
    jobTitle: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["engineer", "admin","customer"],
      default: "engineer",
      required:true,
    },
    socialMedia: {
      linkedIn: {
        type: String,
        trim: true,
        default: "",
      },
      twitter: {
        type: String,
        trim: true,
        default: "",
      },
      github: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
