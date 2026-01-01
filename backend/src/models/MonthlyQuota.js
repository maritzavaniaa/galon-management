import mongoose from "mongoose";

const monthlyQuotaSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: true,
    ref: "Employee"
  },
  month: { 
    type: String, 
    required: true // Format: "YYYY-MM" 
  },
  quotaTotal: { 
    type: Number, 
    required: true 
  },
  quotaUsed: { 
    type: Number, 
    default: 0 
  },
  remainingQuota: { 
    type: Number, 
    required: true 
  }
}, { 
    timestamps: true,
    collection: "monthly-quotas" });

// Index unik agar satu karyawan tidak punya dua data di bulan yang sama
monthlyQuotaSchema.index({ employeeId: 1, month: 1 }, { unique: true });

const MonthlyQuota = mongoose.model("MonthlyQuota", monthlyQuotaSchema);
export default MonthlyQuota;