import express from "express";
import cors from "cors";
import employeeRoute from "./routes/employee.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", employeeRoute);

export default app;