import { Schema } from "mongoose";
import mongoose from "mongoose";

const bookEngineerSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startDate: {
      type: Date,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    branchCode: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    localContact: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalCostOfBooking: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    paymentId: {
      type: String,
      default: "",
    },
    orderId: {
      type: String,
    },
    engineerAssign:{
      type:String,
      enum:["Pending","Assigned"],
      default:"Pending"
    }
  },
  { timestamps: true }
);

const EngineerForm = mongoose.model("EngineerForm", bookEngineerSchema);

export default EngineerForm;
