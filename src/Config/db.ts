import mongoose from "mongoose";

export const dbConnect = async () => {
  const mongoURI = process.env.MONGO_URI;
  
  if (!mongoURI) {
    console.error("MongoDB connection string (MONGO_URI) is not defined");
    throw new Error("MongoDB connection string is missing");
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error; // Throw error instead of exiting the process
  }
};
