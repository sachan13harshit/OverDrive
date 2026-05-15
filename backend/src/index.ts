import express from "express";
import cors from "cors";

import { envChecker } from "./config/env.js";

envChecker();

import authRouter from "./routes/auth.routes.js";
import driveRouter from "./routes/drive.routes.js";
import { reconcileStuckIngestions, startReconciliationSweep } from "./services/reconciliation.service.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/drive", driveRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  reconcileStuckIngestions().catch((err) => console.error("[reconcile] Startup sweep failed:", err));
  startReconciliationSweep();
});
