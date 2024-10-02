import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const database = async () => {
  try {
    console.log('MongoDB URL:', process.env.dburl);  // Add this line to verify the database URL

    // Use environment variable for the database URL
    const data = await mongoose.connect(process.env.dburl, {
      useNewUrlParser: true,    // Recommended options to avoid warnings
      useUnifiedTopology: true  // Ensures MongoDB drivers are updated
    });
    console.log(`Database connected successfully`);
  } catch (error) {
    console.error(`Database connection failed:`, error.message);  // Log the error for debugging
  }
};

export default database;
