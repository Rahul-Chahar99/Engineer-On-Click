import mongoose from "mongoose";
import { Schema } from "mongoose";


const subcriptionSchema =Schema.create({
    subscriber :{
        type:Schema.Types.ObjectId,//one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})




export const  Subscription=mongoose.model("Subcription",subcriptionSchema) 