import { Schema } from "mongoose";
import mongoose from "mongoose";

const bookEngineerSchema =  new Schema({
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    startDate:{
        type:String,
        required:true
    },
    pincdode:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    endDate:{
        type:String,
        required:true
    },
    branchCode:{
        type:Number,
        required:true
    },
    branchName:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    localContact:{
        type:String,
        required:true,
    },
    startTime:{
        type:String,
        required:true,
    },
    endTime:{
        type:String,
        required:true,
    },


},{timestamps:true})

 const EngineerForm =mongoose.model("EngineerForm",bookEngineerSchema)

 export default EngineerForm;