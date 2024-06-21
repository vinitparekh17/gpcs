import type { Request } from 'express';
import { Router } from 'express';
import crypto from 'node:crypto';
import multer from 'multer';
import multerS3 from 'multer-s3';
import passport from 'passport';

const userRouter = Router();

import {
    signUp,
    signIn,
    profile,
    passwardReset,
    updateAccount,
    forgotPassword,
    signOut,
    deleteAccount,
} from '../controllers/userController';
import { s3Client } from '../lib/aws/s3';
import { AWS_BUCKET_NAME } from '../config';

// unprotected routes
userRouter.route('/signin').post(signIn);
userRouter.route('/signup').post(signUp);
userRouter.route('/forgotpassword').post(forgotPassword);
userRouter.route('/resetpassword/:token').post(passwardReset);

//protected routes
userRouter.use(passport.authenticate('jwt', { session: false }));
userRouter.route('/profile').get(profile);
userRouter.route('/delete/:id').get(deleteAccount);
userRouter.route('/signout').get(signOut);

userRouter.route('/update/:id').post(
    multer({
        fileFilter: (
            _: Request,
            file: Express.Multer.File,
            cb: (err: Error | null, accept: boolean) => void
        ) => {
            try {
                const allowedMimeTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                ];
                if (allowedMimeTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            } catch (error) {
                cb(error, false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        storage: multerS3({
            s3: s3Client,
            bucket: AWS_BUCKET_NAME,
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
                    `profile/${
                        crypto.randomBytes(16).toString('hex') +
                        file.originalname.slice(-8)
                    }`
                );
            },
        }),
    }).single('profile'),
    updateAccount
);

export default userRouter;
