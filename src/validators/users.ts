import { body } from 'express-validator'
import { SupportedNats } from '../enums/nat'

export const editUsersValidator = [
    body('userIds', 'Invalid does not Empty').not().isEmpty(),
    body('userIds', 'Invalid does not Array').isArray({ min: 1 }),
]

export const deleteUserValidator = [
    body('userIds', 'Invalid does not Empty').not().isEmpty(),
    body('userIds', 'Invalid does not Array').isArray({ min: 1 }),
]

export function isValidRegion(region: string): region is SupportedNats {
    return Object.values(SupportedNats).includes(region as SupportedNats)
}