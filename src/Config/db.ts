import mongoose from 'mongoose';

export const dbConnect = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB connection string (MONGO_URI) is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process on failure
  }
};