import express from "express";
import Transaction from "../models/Transaction.js";
import Employee from "../models/employee.js";

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
      return res.status(400).json({ message: "employeeId and amount required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "amount must be > 0" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const transaction = await Transaction.create({
      employeeId,
      amount
    });

    res.status(201).json(transaction);
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

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
