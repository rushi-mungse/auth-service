import express from "express";
import { errorHandler } from "./middlewares";
import authRouter from "./routes/auth";

const app = express();

// register auth router
app.use("/api/auth", authRouter);

// error handler middleware
app.use(errorHandler);

export default app;
