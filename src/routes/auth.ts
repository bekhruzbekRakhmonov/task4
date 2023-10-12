import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import * as userService from '../services/users';
import * as authService from '../services/auth';
import {
    loginValidator,
    refreshTokenValidator,
    registerValidator,
} from '../validators/auth';
import { config } from 'dotenv';
config();

const router = express.Router()

router.post(
    '/register',
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() })
            }

            const { name, email, password } = req.body
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = await userService.createUser({
                name,
                email,
                password: hashedPassword,
            })

            res.status(201).json(newUser)
        } catch (error) {
            next(error)
        }
    },
)

router.post(
    '/login',
    loginValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            const user = await userService.findByEmail(email)
            if (!user || user.status === 'blocked') {
                return res.status(404).json({ message: 'User not found' })
            }

            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid password' })
            }

            const accessToken = authService.generateAccessToken({
                id: user.id,
                email: user.email,
            })
            const refreshToken = authService.generateRefreshToken({
                id: user.id,
                email: user.email,
            })

            await userService.updateLastLogin(user.id)

            res.json({ accessToken, refreshToken })
        } catch (error) {
            next(error)
        }
    },
)

router.post(
    '/refresh-token',
    refreshTokenValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.body.refreshToken

            if (!refreshToken) {
                return res
                    .status(400)
                    .json({ message: 'Refresh token is required.' })
            }

            const decodedToken = authService.verifyRefreshToken(
                refreshToken,
            ) as {
                id: number
                email: string
            }
            const accessToken = authService.generateAccessToken({
                id: decodedToken.id,
                email: decodedToken.email,
            })

            res.json({ accessToken })
        } catch (error) {
            next(error)
        }
    },
)

export default router
