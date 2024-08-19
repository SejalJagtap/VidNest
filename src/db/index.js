import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async () => {
    try {
        console.log(process.env.MONGODB_URL)
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`db connected ${connection.connection.host}`);

    } catch (error) {
        console.log("error in connection", error)
        process.exit(1)
    }
}
export default connectDB
