import express from 'express';
import connectDB from './dbconfig/dbConnection.js'; // Import the database connection function
import { app } from './app.js'; // Import the Express application setup
import dotenv from 'dotenv'; // For loading environment variables from the .env file

// Load environment variables
dotenv.config({
    path: './.env' // Providing path ./env means the .env file is available in the home/root directory
});

// Function to validate essential environment variables it helps cheks the .env file is avaliable or not
const validateEnv = () => {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in .env'); // Check if MONGO_URI is defined
    if (!process.env.PORT) throw new Error('PORT is missing in .env'); // Check if PORT is defined
};
validateEnv(); // Call validation function

// Start the server after establishing a database connection instead of direct calling the database coneection function we create another function
const startServer = async () => {
    try {
        await connectDB(); // Connect to the database
        const PORT = process.env.PORT || 8000; // Use PORT from .env or fallback to 8000
        app.listen(PORT, () => {
            console.log(`Server is listening at ${PORT}`); // Log the server's listening port
        });
    } catch (err) {
        console.error(`Failed to start server: ${err.message}`); // Log the error if the server fails to start
    }
};

startServer(); // Start the server process
