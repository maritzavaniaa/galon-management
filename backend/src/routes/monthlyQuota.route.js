import express from "express";
import MonthlyQuota from "../models/MonthlyQuota.js";
import Employee from "../models/employee.js";

const router = express.Router();

// 1. Inisialisasi jatah bulanan untuk SEMUA karyawan (Bisa dipanggil Admin setiap awal bulan)
router.post("/monthly-quota/init", async (req, res) => {
  try {
    const { month } = req.body; // Format : YYYY-MM
    if (!month) {
        return res.status(400).json({message: "Month is required (YYYY-MM"})
    };

    const employees = await Employee.find({}).populate("level");
    
    const results = await Promise.all(employees.map(async (emp) => {
        const quotaFromLevel = emp.level ? emp.level.monthlyQuota || 0 : 0;

        return await MonthlyQuota.findOneAndUpdate(
            { employeeId: emp._id, month: month },
            { 
            quotaTotal: quotaFromLevel, 
            remainingQuota: quotaFromLevel,
            quotaUsed: 0 
            },
            { upsert: true, new: true }
        );
    }));

    res.status(201).json({ 
        message: `Jatah bulan ${month} berhasil disiapkan`, 
        data: results 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET data laporan bulanan (Untuk bahan export CSV)
router.get("/monthly-quota/:month", async (req, res) => {
  try {
    const data = await MonthlyQuota.find({ month: req.params.month });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;