import mongoose , { Schema } from "mongoose";

const customerSchema = new Schema ({
    companyName:{
        type:String,
        required:true,
        unique:true,
    },
    email :{
        type:String,
        required:true,
        unique:true,
    
    },
    phoneNumber:{
        type:String,
        required:true,
        unique:true,
        maxlength:[10,"Number should be of 10 digits"],
        minlength:[10,"Number should be of 10 digits"]
    },
    
    password:{
        type:String,
        required:true,
    },
    // gstNo:{
    //     type:String,
    //     required:true,
    //     unique:true,
    // },
    


    
},{timestamps:true})