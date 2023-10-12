import { body } from 'express-validator'

export const registerValidator = [
    body('email', 'Invalid does not Empty').notEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('name', 'Invalid does not Empty').notEmpty(),
    body('password', 'The minimum password length is 1 character').isLength({
        min: 1,
    }),
]

export const loginValidator = [
    body('email', 'Invalid does not Empty').notEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'The minimum password length is 1 character').isLength({
        min: 1,
    }),
]

export const refreshTokenValidator = body(
    'refreshToken',
    'Invalid does not Empty',
).notEmpty()
