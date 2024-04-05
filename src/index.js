import Mongoose from "mongoose";
import DB_NAME from "./constants";
import connectDB from "./db/db";

connectDB();










/*
(async () => {
    try {
        await Mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    } catch (error) {
        console.error("Error:", error);
        throw err
    }
})();
*/