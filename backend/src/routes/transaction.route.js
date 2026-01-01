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
        const { employeeId, amount } = req.body; 
    
        if (!employeeId || !amount) {
            return res.status(400).json({message: "employeeId dan amount wajib diisi"});
        }

        if (amount <= 0) {
            return res.status(400).json({message: "amount harus > 0"});
        }

        const currentMonth = new Date().toISOString().slice(0,7);

        const quota = await MonthlyQuota.findOne({
            employeeId,
            month: currentMonth
        });

        if (!quota) {
            return res.status(404).json({message: "Quota bulan ini belum diinisialisasi"})
        }

        if (quota.remainingQuota < amount) {
            return res.status(400).json({message: "Quota tidak mencukupi"});
        }

        quota.quotaUsed += amount;
        quota.remainingQuota -= amount;
        await quota.save();

        const transaction = await Transaction.create({
            employeeId,
            amount
        });
    
        res.status(201).json({ 
            message: "Transaksi berhasil",
            transaction, 
            remainingQuota: quota.remainingQuota 
        });
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
      return res.status(403).json({ message: "Password salah" });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // Validasi: hanya hari ini
    const { start, end } = getTodayRange();
    const createdAt = new Date(transaction.createdAt);

    if (createdAt < start || createdAt > end) {
      return res.status(403).json({
        message: "Hanya transaksi hari ini yang bisa dihapus"
      });
    }

    // Rollback quota
    const currentMonth = createdAt.toISOString().slice(0, 7);
    const quotaRecord = await MonthlyQuota.findOne({
        employeeId: transaction.employeeId,
        month: currentMonth
    });

    await transaction.deleteOne();

    const usedAgg = await Transaction.aggregate([
        {
            $match: {
                employeeId: transaction.employeeId,
                createdAt: {
                    $gte: new Date(`${currentMonth}-01`),
                    $lt: new Date(`${currentMonth}-31`)
                }
            }
        },
        {
            $group: {
                _id: null,
                totalUsed: {$sum:"$amount"}
            }
        }
    ]);

    const totalUsed = usedAgg[0]?.totalUsed || 0;

    quotaRecord.quotaUsed = totalUsed;
    quotaRecord.remainingQuota = quotaRecord.quotaTotal - totalUsed;
    await quotaRecord.save();

    res.json({ 
        message: "Transaksi berhasil dihapus",
        employeeId: transaction.employeeId,
        remainingQuota: quotaRecord.remainingQuota
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
