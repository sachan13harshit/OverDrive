import express from "express";
import cors from "cors";

import { envChecker } from "./config/env.js";

envChecker();

import authRouter from "./routes/auth.routes.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/auth", authRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
