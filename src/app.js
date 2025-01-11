import express, { urlencoded } from "express"; // Import express and urlencoded for parsing request bodies
import cookieParser from "cookie-parser"; // To parse cookies sent by the client
import cors from 'cors'; // Cors is used for enabling connections between client and server

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allow only specified origin from .env
    credentials: true // Allow cookies with cross-origin requests
}));
app.use(express.json({ limit: "15kb" })); // Parse incoming JSON requests with a size limit
app.use(express.urlencoded({ extended: true, limit: "15kb" })); // Parse URL-encoded requests with extended option and size limit
app.use(express.static("public")); // Serve static files from the 'public' folder
app.use(cookieParser()); // Parse cookies and make them understandable to the server

export { app }; // New ES module syntax for exporting the Express app