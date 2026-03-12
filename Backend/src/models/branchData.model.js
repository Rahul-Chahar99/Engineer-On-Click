import mongoose, { Schema } from "mongoose";

const branchSchema = new Schema(
  {
    branchCode: {
      type: String,
      required: true,
      unique: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    branchManagerDetails: [
      {
        managerCode: {
          type: String,
          required: true,
          unique: true,
        },
        managerName: {
          type: String,
          required: true,
        },
        managerEmail: {
          type: String,
          required: true,
        },
        managerPhoneNumber: {
          type: String,
          required: true,
        },
      },
    ],
    branchAddress: {
      type: String,
      required: true,
    },
    branchLocationGoogleLink: {
      type: String,
    },
    
  },
  { timestamps: true }
);

export const BranchData = mongoose.model("BranchData", branchSchema);




