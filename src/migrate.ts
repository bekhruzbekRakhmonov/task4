import fs from 'fs'
import { pool } from './db'

async function executeSqlFile(filePath: string) {
    try {
        const sql = fs.readFileSync(filePath, 'utf8')

        const connection = await pool.getConnection()

        const [results] = await connection.execute(sql)

        connection.release()
        console.log('SQL file executed successfully.')

        console.log('Results:', results)
    } catch (error) {
        console.error('Error executing SQL file:', error)
    }
}

const sqlFilePath = 'db.sql'
executeSqlFile(sqlFilePath)
