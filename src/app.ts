import "reflect-metadata";
import express from "express";
import { errorHandlerMiddleware } from "./middlewares";
import authRouter from "./routes/auth";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());

// register auth router
app.use("/api/auth", authRouter);

// error handler middleware
app.use(errorHandlerMiddleware);

export default app;
