import mongoose from "mongoose";
import { InvalidateCacheProps } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";

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

const invalidateCache =async ({product ,order,admin}:InvalidateCacheProps) => {
if(product){
  const productKeys:string[]=[
    "latest-products",
    "categories",
    "all-products",
     
  ]
  const products=await Product.find({}).select("_id")

  products.forEach((i)=>{
    productKeys.push(`product-${i._id}`)
  })
  myCache.del(productKeys);
}
if(order){}
if(admin){}
}

export { connectDB,invalidateCache };