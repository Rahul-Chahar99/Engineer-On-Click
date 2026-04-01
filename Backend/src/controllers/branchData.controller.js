import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { BranchData } from "../models/branchData.model.js";
import redisClient from "../utils/redisClient.js";

const createBranch = asyncHandler(async(req,res)=>{
    const {branchCode,branchName,branchAddress,branchLocationGoogleLink} = req.body;
    const branchManagerDetails = req.body.branchManagerDetails || [];
    
    // Check required fields
    if([branchCode,branchName,branchAddress,branchLocationGoogleLink].some((field)=>(!field || field.trim()===""))){
        throw new ApiError(400,"Branch code, name, and address are required");
    }

    // Validate branchManagerDetails array
    if(!Array.isArray(branchManagerDetails)){
        throw new ApiError(400,"Branch manager details must be an array");
    }

    
    // Validate each manager in the array
    if(branchManagerDetails.length>0 && branchManagerDetails.some((manager)=>(!manager.managerCode || !manager.managerName || !manager.managerEmail || !manager.managerPhoneNumber))){
        throw new ApiError(400, "All manager fields (code, name, email, phone) are required")
    }
    
    // Create branch with manager details
    const branch = await BranchData.create({
        branchCode,
        branchName,
        branchManagerDetails,
        branchAddress,
        branchLocationGoogleLink: branchLocationGoogleLink || ""
    });

    if(!branch){
        throw new ApiError(500,"Failed to create branch");
    }
    try {
        const keys = await redisClient.keys("get_all_banks*");
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } catch (error) {
        console.error("Redis cache deletion error: ", error);
      }

    // Clear the Redis cache so the next GET request fetches the newly created branch
    

    return res.status(201).json(
        new ApiResponse(201, branch, "Branch created successfully")
    );
});

const getBranchByCode = asyncHandler(async(req,res)=>{
    const {branchCode} = req.body;

    if(!branchCode || branchCode.trim()===""){
        throw new ApiError(400,"Branch code is required");

    }
    const branch = await BranchData.findOne({branchCode})
    if(!branch){
        throw new ApiError(404, "Branch not found");
    }

    return res.status(200)
    .json(new ApiResponse(200,branch,"Branch Data Fetched Successfully"))
})

export { createBranch,getBranchByCode };