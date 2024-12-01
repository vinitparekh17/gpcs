import type { Request } from "express";
import { Router } from "express";
import crypto from "node:crypto";
import multer from "multer";
import multerS3 from "multer-s3";
import passport from "passport";

const userRouter = Router();

import {
  deleteAccount,
  forgotPassword,
  passwardReset,
  profile,
  signIn,
  signOut,
  signUp,
  updateAccount,
} from "../controllers/userController.ts";
import { s3Client } from "../lib/aws/s3.ts";
import { AWS_BUCKET_NAME } from "../config/index.ts";

const bucketName = AWS_BUCKET_NAME || "default-bucket-name";

// unprotected routes
userRouter.route("/signin").post(signIn);
userRouter.route("/signup").post(signUp);
userRouter.route("/forgotpassword").post(forgotPassword);
userRouter.route("/resetpassword/:token").post(passwardReset);

//protected routes
userRouter.use(passport.authenticate("jwt", { session: false }));
userRouter.route("/profile").get(profile);
userRouter.route("/delete/:id").get(deleteAccount);
userRouter.route("/signout").get(signOut);

userRouter.route("/update/:id").post(
  multer({
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback,
    ) => {
      try {
        const allowedMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"));
        }
      } catch (error) {
        if (error instanceof Error) {
          cb(error);
        } else {
          cb(new Error("Unknown error"));
        }
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    storage: multerS3({
      s3: s3Client,
      bucket: bucketName,
      contentType: (
        _: Request,
        file: Express.MulterS3.File,
        cb: (err: Error | null, mimetype: string) => void,
      ) => {
        cb(null, file.mimetype);
      },
      key: (
        _: Request,
        file: Express.MulterS3.File,
        cb: (err: Error | null, key: string) => void,
      ) => {
        cb(
          null,
          `profile/${
            crypto.randomBytes(16).toString("hex") +
            file.originalname.slice(-8)
          }`,
        );
      },
    }),
  }).single("profile"),
  updateAccount,
);

export default userRouter;
