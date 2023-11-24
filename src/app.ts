import "reflect-metadata";
import express, { Request, Response } from "express";
import { errorHandler } from "./middlewares";
import authRouter from "./routes/auth";

const app = express();

app.use(express.json());

// register auth router
app.use("/api/auth", authRouter);

// error handler middleware
app.use(errorHandler);

export default app;
