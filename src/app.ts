import "reflect-metadata";
import express from "express";
import { errorHandlerMiddleware } from "./middlewares";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const corsOption: cors.CorsOptions = {
    origin: ["*"],
    credentials: true,
};

app.use(cors(corsOption));

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());

// register  routers
app.use("/api/auth", authRouter);
app.use("/api/tenant", tenantRouter);
app.use("/api/user", userRouter);

// error handler middleware
app.use(errorHandlerMiddleware);

export default app;
