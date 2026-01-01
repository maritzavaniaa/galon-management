import express from "express";
import Employee from "../models/employee.js";

const router = express.Router();

// POST /api/employees
router.post("/employees", async (req, res) => {
  try {
    const { _id } = req.body;

    if (await Employee.findOne({ _id })) {
      return res.status(409).json({ message: "Employee already exists" });
    }

    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/employees
router.get("/employees", async (req, res) => {
  const employees = await Employee.find({ isActive: true });
  res.json(employees);
});

// GET /api/employees/:_id
router.get("/employees/:_id", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params._id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json(employee);  
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
