import mongoose from "mongoose";

const connectDB = async () => {
    let connected = false;
    while (!connected) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            connected = true;
        } catch (error) {
            console.error(`Error connecting to MongoDB: ${error.message}. Retrying in 5 seconds...`);
            // Wait for 5 seconds before retrying
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
};

export default connectDB;
