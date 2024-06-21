import passport from 'passport';

import { Router } from 'express';

const adminRouter = Router();

import {
    GetAllUsers,
    signIn,
    GetUserById,
    DeleteUserById,
    UpdateUserById,
} from '../controllers/adminController';

adminRouter.route('/signin').post(signIn);

adminRouter.use(passport.authenticate('jwt', { session: false }));

adminRouter.route('/getuser').get(GetAllUsers);
adminRouter.route('/getuser/:id').get(GetUserById);

adminRouter.route('/delete/user/:id').delete(DeleteUserById);
adminRouter.route('/update/user/:id').post(UpdateUserById);

export default adminRouter;
