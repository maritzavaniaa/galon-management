import express from "express";
import Transaction from "../models/Transaction.js";
import Employee from "../models/employee.js";
import MonthlyQuota from "../models/MonthlyQuota.js";

const router = express.Router();

// Range hari ini
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// POST /api/transactions - add new transaction
router.post("/transactions", async (req, res) => {
    try {
        const { month } = req.body; // Format: "YYYY-MM"
    
        // Ambil semua employee dan populate field level
        const employees = await Employee.find({}).populate('level');
    
        const results = await Promise.all(
          employees.map(async (emp) => {
            if (!emp.level || emp.level.monthlyQuota == null) {
              throw new Error(`Level quota not defined for employee ${emp.name}`);
            }
    
            const quota = emp.level.monthlyQuota;
    
            return await MonthlyQuota.findOneAndUpdate(
              { employeeId: emp._id, month: month },
              { 
                quotaTotal: quota,
                remainingQuota: quota,
                quotaUsed: 0 
              },
              { upsert: true, new: true }
            );
          })
        );
    
        res.status(201).json({ message: `Jatah bulan ${month} berhasil disiapkan`, data: results });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
});

// GET /api/transactions/today - read today transactions
router.get("/transactions/today", async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const transactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id - delete today transaction using password
router.delete("/transactions/:id", async (req, res) => {
  try {
    const { password } = req.body;

    if (password !== process.env.ADMIN_DELETE_PASSWORD) {
      return res.status(403).json({ message: "Invalid password" });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { start, end } = getTodayRange();
    const createdAt = new Date(transaction.createdAt);

    if (createdAt < start || createdAt > end) {
      return res.status(403).json({
        message: "Only today's transactions can be deleted"
      });
    }

    const currentMonth = createdAt.toISOString().slice(0, 7);
    const quotaRecord = await MonthlyQuota.findOne({
        employeeId: transaction.employeeId,
        month: currentMonth
    });

    if (quotaRecord) {
        quotaRecord.quotaUsed -= transaction.amount;
        quotaRecord.remainingQuota += transaction.amount;
        await quotaRecord.save();
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
