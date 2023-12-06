import "reflect-metadata";
import express from "express";
import { errorHandlerMiddleware } from "./middlewares";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());

// register  routers
app.use("/api/auth", authRouter);
app.use("/api/tenant", tenantRouter);

// error handler middleware
app.use(errorHandlerMiddleware);

export default app;
