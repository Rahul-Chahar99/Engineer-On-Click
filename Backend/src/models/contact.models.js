import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: [10, "Number should be of 10 digits"],
    maxlength: [10, "Number should be of 10 digits"],
  },
  message: {
    type: String,
    required: true,
  },
});


const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
