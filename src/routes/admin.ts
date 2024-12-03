import passport from 'passport';

import { Router } from 'express';

const adminRouter = Router();

import {
	DeleteUserById,
	GetAllUsers,
	GetUserById,
	signIn,
	UpdateUserById,
} from '../controllers/adminController.ts';

adminRouter.route('/signin').post(signIn);

adminRouter.use(passport.authenticate('jwt', { session: false }));

adminRouter.route('/getuser').get(GetAllUsers);
adminRouter.route('/getuser/:id').get(GetUserById);

adminRouter.route('/delete/user/:id').delete(DeleteUserById);
adminRouter.route('/update/user/:id').post(UpdateUserById);

export default adminRouter;
