import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { AsyncHandler } from "../handlers/index.ts";
import type { EmailFormat, User as UserType } from "../types/index.ts";
import EmailService from "../lib/aws/ses.ts";
import { Cookie, Err, Success } from "../utils/index.ts";
import { PasswordResetTemplate, SignUpTemplate } from "../utils/Template.ts";
import { User } from "../db/postgresql/models/User.ts";

export const signUp = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return Err.send(res, 400, "Please fill all the fields!");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userParam: UserType = {
      firstName,
      lastName,
      email,
      password: hash,
      role: "USER",
      profile: "",
      forgotpasstoken: "",
      forgotpassexpire: 0,
      createdAt: new Date(),
    };

    const user = new User(userParam);

    const savedUser =  await user.insert();

        if (!(savedUser instanceof Error)) {
          user.id = savedUser.id;
          await EmailService.sendMail({
            to: savedUser.email,
            subject: "Signed Up Successfully | Omnisive",
            html: SignUpTemplate(
              `${savedUser.firstName} ${savedUser.lastName}`,
            ),
          });

          return Cookie.send(res, req, user, 201);
        }

        return Err.send(res, 500, savedUser.message); 
  })

export const signIn = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    const existUser = await User.getUserByEmail(email);
    if (existUser && existUser.password) {
      const matchPass = await bcrypt.compare(
        password,
        existUser.password,
      );

      if (matchPass) {
        return Cookie.send(res, req, existUser, 200);
      }
      return Err.send(res, 400, "Password did not matched");
    }
    return Err.send(
      res,
      400,
      "User with these credentials does not exists",
    );
  },
);

export const forgotPassword = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    const existUser = await User.getUserByEmail(email);

    if (!existUser) {
      return Err.send(res, 404, "User with this email does not exists!");
    }

    const token = await existUser.getForgotTokenAndSave();

    const url =
      `${req.protocol}://${req.hostname}/passward/reset?token=${token}`;

    const options: EmailFormat = {
      to: email,
      subject: "Password Reset Requested | Omnisive",
      html: PasswordResetTemplate(url),
    };

    const emailStatus = await EmailService.sendMail(options);

    return emailStatus
      ? Success.send(res, 201, "Email has been sent to you")
      : Err.send(res, 401, "Unable to send email!");
  },
);

export const passwardReset = AsyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    const foundUser = await User.getUserByForgotToken(token);

    if (!foundUser) {
      return Err.send(res, 400, "Token is invalid or expired");
    }

    const { password } = req.body;

    await foundUser.resetPassword(password);

    return Success.send(res, 200, "Password has been reset successfully");
  },
);

export const profile = AsyncHandler((req: Request, res: Response): Response => {
  if (!req.user) return Err.send(res, 404, "User not found");
  return Success.send(res, 200, req.user);
});

export const updateAccount = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName, email, profileURL } = req.body;

    const profile = req.file as Express.MulterS3.File;

    if (!firstName || !lastName || !email) {
      return Err.send(res, 400, "Please fill all the fields!");
    }

    if (profile && profile.location) {
      await User.updateById(
        {
          firstName,
          lastName,
          email,
          profile: profile.location
        },
        req.params.id,
      )
        .then((user: UserType) => {
          return Success.send(res, 200, user);
        })
        .catch(() => {
          return Err.send(
            res,
            404,
            "User with this id does not exists",
          );
        });

      return Err.send(res, 500, "Internal server error");
    }

    await User.updateById(
      {
        firstName,
        lastName,
        email,
        profile: profileURL,
        role: null,
        forgotpasstoken: null,
        forgotpassexpire: null,
        createdAt: undefined
      },
      req.params.id,
    )
      .then((user: UserType) => {
        return Success.send(res, 200, user);
      })
      .catch(() => {
        return Err.send(res, 404, "User with this id does not exists");
      });

    return Err.send(res, 500, "Internal server error");
  },
);

export const deleteAccount = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    await User.deleteById(id);

    return Success.send(res, 202, "User has been deleted successfully");
  },
);

export const signOut = AsyncHandler(
  (_req: Request, res: Response): Response => {
    return res
      .clearCookie("jwt-token")
      .status(200)
      .json({ success: true, message: "Successfully logged out!" });
  },
);
