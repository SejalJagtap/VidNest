import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'
import userRouter from './routes/user.route.js'
import subscriptionRouter from './routes/subscription.route.js'
import videoRouter from './routes/video.route.js'
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
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
export { app }