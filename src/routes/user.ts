// @deno-types="npm:@types/express@^5.0"
import { Request, Router, RequestHandler } from "express";
import crypto from "node:crypto";

// @deno-types="npm:@types/multer@^1.4"
import multer, { FileFilterCallback } from "multer";

// @deno-types="npm:@types/multer-s3@^3.0"
import multerS3 from "multer-s3";
import passport from "passport";

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
import path from "node:path";


const bucketName = AWS_BUCKET_NAME || "default-bucket-name";

const s3Storage = multerS3({
  s3: s3Client,
  bucket: bucketName,
  contentType: (
    _: Request,
    file: Express.MulterS3.File,
    cb: (err: Error | null, mimetype: string) => void
  ) => {
    cb(null, file.mimetype);
  },
  key: (
    _: Request,
    file: Express.MulterS3.File,
    cb: (err: Error | null, key: string) => void
  ) => {
    cb(
      null,
      `profile/${crypto.randomBytes(16).toString("hex")}${path.extname(
        file.originalname
      )}`
    );
  },
});

const profileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed types: JPEG, PNG, WEBP."));
  }
}

const userRouter = Router();

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
  (multer({
    fileFilter: profileFilter,
    limits: { fileSize: 5 * 1024 * 1024}, // 5 MB,
    storage: s3Storage,
  }).single("profile") as unknown as RequestHandler),
  updateAccount
);

export default userRouter;
