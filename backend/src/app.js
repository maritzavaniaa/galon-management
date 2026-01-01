import express from "express";
import cors from "cors";
import employeeRoute from "./routes/employee.route.js";
import transactionRoute from "./routes/transaction.route.js";
import monthlyQuotaRoute from "./routes/monthlyQuota.route.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", employeeRoute);
app.use("/api", transactionRoute);
app.use("/api", monthlyQuotaRoute);

export default app;