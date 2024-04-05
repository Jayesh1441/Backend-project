import { Mongoose } from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async () => {
    try {
        const connectionInstance = await Mongoose.console(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB connected !! HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("Error connecting to the database: ", error);
        process.exit(1);
        throw (error);
    }
}

export default connectDB;