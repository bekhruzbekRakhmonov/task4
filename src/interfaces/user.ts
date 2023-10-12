import { RowDataPacket } from 'mysql2'

export interface UserRow extends RowDataPacket {
    id: number
    name: string
    email: string
    status: 'active' | 'blocked'
    password: string
    last_login: Date
    registration_time: Date
}

export interface User {
    id: number
    name: string
    email: string
    status: 'active' | 'blocked'
    password: string
    last_login: Date
    registration_time: Date
}
