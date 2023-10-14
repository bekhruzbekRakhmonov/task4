import express, { Express } from 'express'
import cors from 'cors';
import morgan from 'morgan'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import userRouter from './routes/users'
import authRouter from './routes/auth'
import { authenticateToken } from './middleware/auth'
import exceptionFilter from './middleware/exception'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3000

const v1Router = express.Router()

app.use(
    cors({
        origin: process.env.ORIGIN,
    }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))
app.use(express.static('public'))

app.use(exceptionFilter)

app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        swaggerOptions: {
            url: '/swagger.json',
        },
    }),
)
v1Router.use('/users', authenticateToken, userRouter)
v1Router.use('/auth', authRouter)

app.use('/api', v1Router)

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
