import express from "express";
import cors from "cors";
import employeeRoute from "./routes/employee.route.js";
import transactionRoute from "./routes/transaction.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", employeeRoute);
app.use("/api", transactionRoute);

export default app;