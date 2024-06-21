import { Response, Request } from 'express';
import { IUser } from '../interface';

export class Success {
    static send(
        res: Response,
        statusCode: number,
        data: object | string
    ): Response {
        return res
            .status(statusCode)
            .json({ success: true, data: data || null });
    }
}

export class Err {
    static send(res: Response, statusCode: number, message: string): Response {
        return res.status(statusCode).json({ success: false, message });
    }
}

export class Cookie {
    static send(
        res: Response,
        _: Request,
        user: IUser,
        statusCode: number
    ): Response {
        const token = user.getJWT();
        delete user.password;

        return res
            .cookie('jwt-token', token, {
                path: '/',
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            })
            .status(statusCode)
            .json({
                success: true,
                data: user,
            });
    }
}
