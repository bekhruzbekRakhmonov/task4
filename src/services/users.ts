import { pool } from '../db'
import HttpException from '../exceptions/http-exception'
import { User, UserRow } from '../interfaces/user'
import { ResultSetHeader } from 'mysql2'

export async function createUser(newUser: {
    name: string
    email: string
    password: string
}): Promise<boolean> {
    try {
        const { name, email, password } = newUser
        const user = await findByEmail(email)
        if (user) {
            throw new HttpException(400, 'User already exists')
        }

        await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password],
        )
        return true
    } catch (error) {
        throw error
    }
}

export async function findAll(
    page: number = 1,
    pageSize: number = 10,
): Promise<User[]> {
    const offset = (page - 1) * pageSize;

    try {
        const query = 'SELECT * FROM users LIMIT ?, ?';
        const [results, fields] = await pool.query<UserRow[]>(query, [
            offset,
            pageSize,
        ])
        return results;
    } catch (error) {
        throw error;
    }
}


export async function findByEmail(email: string): Promise<User | null> {
    try {
        const [rows, fields] = await pool.execute<UserRow[]>(
            'SELECT * FROM users WHERE email = ?',
            [email],
        )

        if (rows.length > 0) {
            return rows[0]
        }
        return null
    } catch (error) {
        throw error
    }
}

export async function updateUserByEmail(
    email: string,
    updatedUserData: Partial<User>,
): Promise<boolean> {
    try {
        const columnsToUpdate = Object.keys(updatedUserData)
            .map((column) => `${column} = ?`)
            .join(', ')
        const values = Object.values(updatedUserData)

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE users SET ${columnsToUpdate} WHERE email = ?`,
            [...values, email],
        )

        if (result && result.affectedRows > 0) {
            return true
        }
        return false
    } catch (error) {
        throw error
    }
}

export async function updateLastLogin(userId: number): Promise<void> {
    try {
        const [result] = await pool.execute<UserRow[]>(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [userId],
        )
        if (result && result.length > 0 && result[0].affectedRows > 0) {
            console.log(
                `Updated ${result[0].affectedRows} row(s) for user with ID: ${userId}`,
            )
        }
    } catch (error) {
        throw error
    }
}

export async function getUsersByIds(userIds: number[]): Promise<User[]> {
    try {
        const [users] = await pool.query<UserRow[]>(
            'SELECT * FROM users WHERE id IN (?)',
            [userIds],
        )
        if (!users || users.length === 0) {
            return [];
        }
        return users
    } catch (error) {
        throw error
    }
}

export async function deleteUsersByIds(userIds: number[]): Promise<boolean> {
    try {
        const placeholders = userIds.map(() => '?').join(', ');

        const query = `DELETE FROM users WHERE id IN (${placeholders})`;

        const [deletedUsers] = await pool.execute<ResultSetHeader>(
            query,
            userIds,
        )

        if (deletedUsers.affectedRows && deletedUsers.affectedRows > 0) {
            return true
        }
        return false;
    } catch (error) {
        // Handle errors and reject the promise with the error object
        console.error('Error deleting users:', error)
        throw error
    }
}

export async function blockUsers(userIds: number[]) {
    const users = await getUsersByIds(userIds)
    for (let user of users) {
        await updateUserByEmail(user.email, { status: 'blocked' })
    }
    return users
}

export async function unblockUsers(userIds: number[]) {
    const users = await getUsersByIds(userIds)
    for (let user of users) {
        await updateUserByEmail(user.email, { status: 'active' })
    }
    return users
}
