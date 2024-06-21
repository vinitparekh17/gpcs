import { Logger } from '../utils';

/**
 * @description
 * This class is used to handle API errors
 * @class ApiError
 * @extends Error
 * @property statusCode: number
 * @param statusCode: number
 * @param message: string
 *
 * @example
 * throw new ApiError(404, 'User not found');
 */

export default class ApiError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
        Logger.error(this.message);
    }
}
