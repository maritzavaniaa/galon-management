import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    _id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
      type: String,
      required: true,
    },
    department: {
        type: String,
        required: true
    },
    level: {
      type: String,
      required: true, 
    },
    pic: {
      type: String, 
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
