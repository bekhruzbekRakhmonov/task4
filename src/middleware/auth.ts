import { Response, Request, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import RequestWithUser from '../interfaces/requestWithUser'
import { findByEmail } from '../services/users'
import { TokenPayload } from '../interfaces/tokenPayload'

dotenv.config()

export function authenticateToken(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) {
    const token = req.header('Authorization')?.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string,
        async (err, payload) => {
            if (err) return res.sendStatus(403)
            const tokenPayload = payload as TokenPayload
            const { id, email, iat } = tokenPayload

            if (!req.user) {
                const user = await findByEmail(email)
                req.user = user
            }
            next()
        },
    )
}
