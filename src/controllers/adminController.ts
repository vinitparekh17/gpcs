import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Cookie, Err, Success } from '../utils/index.ts';
import { AsyncHandler } from '../handlers/index.ts';
import { User } from '../db/postgresql/models/User.ts';

export const signIn = AsyncHandler(
	async (req: Request, res: Response): Promise<Response> => {
		const { email, password } = req.body;

		const existUser = await User.getUserByEmail(email);

		if (existUser) {
			if (!existUser.password) {
				return Err.send(res, 400, 'Invalid credentials');
			}
			const matchPass = await bcrypt.compare(
				password,
				existUser.password,
			);

			if (matchPass) {
				return Cookie.send(res, req, existUser, 200);
			}

			return Err.send(res, 400, 'Invalid credentials');
		}

		return Err.send(res, 400, 'Invalid credentials');
	},
);

export const GetAllUsers = AsyncHandler(
	async (_: Request, res: Response): Promise<Response> => {
		const userData = await User.getAll();
		if (Array.isArray(userData) && userData.length == 0) {
			return Err.send(res, 404, 'Users not found');
		}
		return Success.send(res, 200, userData);
	},
);

export const GetUserById = AsyncHandler(
	async (req: Request, res: Response): Promise<Response> => {
		const { id } = req.params;

		const userData = await User.getById(id);

		return Success.send(res, 200, userData);
	},
);

export const DeleteUserById = AsyncHandler(
	async (req: Request, res: Response): Promise<Response> => {
		const { id } = req.params;

		await User.deleteById(id);
		return Success.send(res, 200, 'User deleted successfully');
	},
);

export const UpdateUserById = AsyncHandler(
	async (req: Request, res: Response): Promise<Response> => {
		const { id } = req.params;
		const { firstName, lastName, profile, email, role } = req.body;
		const userData = await User.updateById(
			{
				firstName,
				lastName,
				email,
				profile,
				role,
			},
			id,
		);
		return Success.send(res, 200, userData);
	},
);
