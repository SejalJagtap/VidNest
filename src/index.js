import 'dotenv/config'

import express from 'express'
import connectDB from './db/index.js';



const app = express()
connectDB()
app.get('/', () => {
    console.log('connected');
})

app.listen(3000, () => {
    console.log('listening');

})