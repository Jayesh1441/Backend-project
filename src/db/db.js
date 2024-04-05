import { mongoose } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB connected !! HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("Error connecting to the database: ", error);
        process.exit(1);
        throw (error);
    }
}

export default connectDB;