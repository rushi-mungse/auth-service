import express, { Request, Response } from "express";
import { errorHandler } from "./middlewares";
import authRouter from "./routes/auth";

const app = express();

app.use("/", (req: Request, res: Response) => {
    res.status(200).send("Hello from auth service");
});

// register auth router
app.use("/api/auth", authRouter);

// error handler middleware
app.use(errorHandler);

export default app;
