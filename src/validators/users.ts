import { body, param } from 'express-validator'

export const editUsersValidator = [
    body('userIds', 'Invalid does not Empty').not().isEmpty(),
    body('userIds', 'Invalid does not Array').isArray({ min: 1 }),
]

export const deleteUserValidator = [
    body('userIds', 'Invalid does not Empty').not().isEmpty(),
    body('userIds', 'Invalid does not Array').isArray({ min: 1 }),
]
