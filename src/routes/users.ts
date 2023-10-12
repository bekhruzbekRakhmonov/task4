import express, { NextFunction, Request, Response, Router } from 'express'
import * as userService from '../services/users'
import RequestWithUser from '../interfaces/requestWithUser'
import { deleteUserValidator, editUsersValidator } from '../validators/users'
import { validationResult } from 'express-validator'

const router: Router = express.Router()

router.get(
    '/',
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const users = await userService.findAll()
            res.status(200).json(users)
        } catch (error) {
            next(error)
        }
    },
)

router.put(
    '/block',
    editUsersValidator,
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() })
            }
            const { userIds } = req.body
            const blockedUsers = await userService.blockUsers(userIds)
            res.status(200).json(blockedUsers)
        } catch (error) {
            next(error)
        }
    },
)

router.put(
    '/unblock',
    editUsersValidator,
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() })
            }
            const { userIds } = req.body;
            const unblockedUsers = await userService.unblockUsers(userIds);
            res.status(200).json(unblockedUsers);
        } catch (error) {
            next(error)
        }
    },
)

router.post(
    '/delete',
    deleteUserValidator,
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() })
            }
            const { userIds } = req.body;
            const success = await userService.deleteUsersByIds(userIds);
            if (!success) {
                return res.status(404).json({
                    message: 'User or Users not found',
                })
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
)

export default router
