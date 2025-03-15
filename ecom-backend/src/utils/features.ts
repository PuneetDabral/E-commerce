import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";

const connectDB = async (uri:string) => {
  try {
    if (mongoose.connections[0].readyState) return;
    console.log('Connecting to MongoDB...');
    mongoose.set('strictQuery', false); // Example of setting a global option
    await mongoose.connect(uri, {
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

const reduceStock=async(orderItems:OrderItemType[])=>{
for(let i=0;i<orderItems.length;i++){
const order=orderItems[i];
const product=await Product.findById(order.productId)
if(!product) throw new Error("Product not found");
product.stock-=Number(order.quantity)
await product.save()

}}

export { connectDB,invalidateCache,reduceStock };