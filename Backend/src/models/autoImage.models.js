import { Schema } from "mongoose";
import mongoose from "mongoose";

const autoImageSchema = new Schema(
  {
    videoUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AutoImage = mongoose.model("AutoImage", autoImageSchema);
export default AutoImage;