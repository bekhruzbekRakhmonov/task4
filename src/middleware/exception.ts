import { NextFunction, Response } from 'express'
import HttpException from '../exceptions/http-exception'
import RequestWithUser from '../interfaces/requestWithUser'

export function exceptionFilter(
    err: any,
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof HttpException) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        })
    } else {
        console.error(err)
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        })
    }
}

export default exceptionFilter
