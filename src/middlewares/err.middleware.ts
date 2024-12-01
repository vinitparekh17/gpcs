import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../handlers/index.ts";

export function ErrorHandler() {
  return (
    err: ApiError,
    _: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).send({
      success: false,
      message: err.message,
      stack: err.stack,
    });
    next();
  };
}
