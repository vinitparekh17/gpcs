// @deno-types="npm:@types/express@^5.0"
import express, { Application, Request, Response } from "express";
import { useMiddleware } from "./middlewares/index.ts";
import { useDatabase } from "./middlewares/db.middleware.ts";
import { usePassport } from "./lib/passport/index.ts";
import promClient from "./lib/prometheus/index.ts";
import router from "./routes/index.ts";
import { SocketMiddleware } from "./middlewares/socket.middleware.ts";


export const app: Application = express();
app.useDatabase = () => useDatabase;
app.useMiddleware = () => useMiddleware;
app.usePassport = () => usePassport;
app.useSocket = () => SocketMiddleware


app.useMiddleware();
app.useDatabase();
app.usePassport();
app.useSocket();

app.use("/metrics", async (_req: Request, res: Response) => {
  res.header("Content-Type", promClient.register.contentType);
  const metrics = await promClient.register.metrics();
  res.send(metrics);
});

app.use("/api/v1", router);

app.all("*", (req: Request, res: Response) => {
  const err = Error(`Requested path: ${req.path} not found!`);
  res.status(404).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
});
