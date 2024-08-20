import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'
import userRouter from './routes/user.route.js'
const app = express();
app.use(cors(
    {
        origin: '*'
    }
))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"))
app.use(cookieparser())

app.use("/api/v1/users", userRouter)
export { app }