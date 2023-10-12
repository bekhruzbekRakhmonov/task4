import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '../interfaces/tokenPayload'
config()

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET

export function generateAccessToken(payload: any): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

export function generateRefreshToken(payload: any): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export function verifyRefreshToken(refreshToken: string): TokenPayload | null {
    try {
        const decodedToken = jwt.verify(
            refreshToken,
            REFRESH_TOKEN_SECRET,
        ) as TokenPayload
        return decodedToken
    } catch (error) {
        // If the token is invalid or expired, jwt.verify will throw an error
        return null
    }
}
