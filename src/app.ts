import express from "express";
import { errorHandler } from "./middlewares";

const app = express();

// error handler middleware
app.use(errorHandler);

export default app;
