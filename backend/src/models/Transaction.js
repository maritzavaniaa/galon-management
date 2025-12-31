import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      ref: "Employee"
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;