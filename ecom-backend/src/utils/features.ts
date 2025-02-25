import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) return;
    console.log('Connecting to MongoDB...');
    mongoose.set('strictQuery', false); // Example of setting a global option
    await mongoose.connect("mongodb+srv://hiteshdabral03:hiteshdabral03@cluster0.cwxfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      dbName: "E-commerce",
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export { connectDB };