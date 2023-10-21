import { NextFunction, Response } from 'express'
import HttpException from '../exceptions/http-exception'
import RequestWithUser from '../interfaces/requestWithUser'

export function exceptionFilter(
    err: any,
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) {
    const resp = res.setHeader('Content-Type', 'application/json');
    if (err instanceof HttpException) {
        resp.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        })
    } else {
        resp.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        })
    }
}

export default exceptionFilter
