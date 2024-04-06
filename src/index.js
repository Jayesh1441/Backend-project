// require('dotenv').config({ path: "./env" });
import dotenv from "dotenv"

import connectDB from "./db/db.js";

import {app} from './app.js'

dotenv.config({ path: "./.env" })

connectDB()
    .then(()=>{
        app.listen(process.env.PORT || 5000, () => console.log(`Server started on port ${process.env.PORT}`))
    })
    .catch((err) => {
        console.log("DB connection is failed", err);
    })










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