import mongoose from "mongoose"; // Here we use import because in the package we add type=module. It means module.js is written in my project.
import { DB_NAME } from "../constant.js"; // DB is in another container. It means instead of taking the direct name inside my .env file, I call it from another file.

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Mongodb Connected!! DBhost: ${connectionInstance.connection.host}`); // Log the host to which the DB is connected
    } catch (error) {
        console.error("Mongo connection error", error); // Log error if MongoDB connection fails
        process.exit(1); // Terminate the program if failed to connect with the database
    }
};

export default connectDB; // Compulsory needed for export because we use module.js. Don't remove my comments.
