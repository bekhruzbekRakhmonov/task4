import express, { NextFunction, Request, Response, Router } from 'express';
import axios from 'axios';
import * as userService from '../services/users';
import RequestWithUser from '../interfaces/requestWithUser';
import { deleteUserValidator, editUsersValidator, isValidRegion } from '../validators/users';
import { validationResult } from 'express-validator';
import { generateErrors } from '../services/users';
import { RandomUser } from '../interfaces/randomUser';
import HttpException from '../exceptions/http-exception';

const router: Router = express.Router()
const RANDOMUSER_API_URL: string = 'https://randomuser.me/api/'

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


router.get('/generate-data', async (req: Request, res: Response, next: NextFunction) => {
    const { region, errors, seed, page } = req.query as {
        region: string
        errors: string
        seed: string
        page: string
    }

    try {
        if (parseInt(errors) > 30) {
            throw new HttpException(422, 'Error limit is 30')
        }
        if (isValidRegion(region)) {
            return res
                .status(400)
                .json({ error: 'Invalid or unsupported region' })
        }

        const response = await axios.get(
            `${RANDOMUSER_API_URL}?results=20&nat=${region}&seed=${seed}`,
        )
        const usersData: Array<{
            randomIdentifier: string
            name: string
            address: string
            phone: string
        }> = (response.data.results as RandomUser[]).map((user: RandomUser) => ({
            randomIdentifier: user.login.uuid,
            name: `${user.name.first} ${user.name.last}`,
            address: `${user.location.street.name}, ${user.location.city}, ${user.location.country}`,
            phone: user.phone,
        }))

        const users = []
        for (let userData of usersData) {
            const [modifiedName, modifiedAddress] = await generateErrors(
                userData.name,
                userData.address,
                parseInt(errors),
                seed,
            )
            users.push({
                ...userData,
                name: modifiedName,
                address: modifiedAddress,
            })
        }
        res.json(users)
    } catch (error) {
        next(error)
    }
});

export default router;
