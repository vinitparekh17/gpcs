// @deno-types="npm:@types/express@^4.19"
import express, { Application } from "express";
import { useMiddleware } from "./middlewares/index.ts";
import { useDatabase } from "./middlewares/db.middleware.ts";
import { usePassport } from "./lib/passport/index.ts";
import promClient from "./lib/prometheus/index.ts";
export const app: Application = express();

import router from "./routes/index.ts";

useMiddleware();
useDatabase();
usePassport();

app.use("/metrics", async (_req, res) => {
  res.header("Content-Type", promClient.register.contentType);
  const metrics = await promClient.register.metrics();
  res.send(metrics);
});

app.use("/api/v1", router);

app.all("*", (req, res) => {
  const err = Error(`Requested path: ${req.path} not found!`);
  res.status(404).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
});
