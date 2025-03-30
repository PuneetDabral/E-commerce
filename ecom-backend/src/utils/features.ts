import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
import { Order } from "../models/order.js";

const connectDB = async (uri: string) => {
  try {
    if (mongoose.connections[0].readyState) return;
    console.log("Connecting to MongoDB...");
    mongoose.set("strictQuery", false); // Example of setting a global option
    await mongoose.connect(uri, {
      dbName: "E-commerce",
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    if (typeof productId === "string") {
      productKeys.push(`product-${productId}`);
    }

    if (typeof productId === "object") {
      productId.forEach((element) => {
        productKeys.push(`product-${element}`);
      });
    }
    myCache.del(productKeys);
  }
  if (order) {
    const orderKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];
    const orders = await Order.find({}).select("_id");

    myCache.del(orderKeys);
  }
  if (admin) {
    myCache.del(["admin-stats","admin-pie-charts","admin-bar-charts","admin-line-charts"])
  }
};

const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product not found");
    product.stock -= Number(order.quantity);
    await product.save();
  }
};

const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) {
    return thisMonth === 0 ? 0 : 100; // Return 0% if both are 0, otherwise return 100%
  }
  const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

const getCategoryCount = async (categories: string[]) => {
  const productsCount = await Product.countDocuments();
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );
  const categoriesCount = await Promise.all(categoriesCountPromise);
  const categoryCount: Record<string, number>[] = [];
  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    });
  });

  return { categoryCount, categoriesCount, productsCount };
};

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type FuncProps = {
  length: number;
  docArr: MyDocument[];
  property?: "discount"|"total";
};

const getChartsData = ({ length, docArr, property }: FuncProps) => {
  const today = new Date();
  let data: number[] = new Array(length).fill(0);

  docArr.forEach((order) => {
    const creationDate = order.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
    if (monthDiff < length) {
      if(property) {
        data[length - monthDiff - 1] += order[property]! ;
      }else{
        data[length - monthDiff - 1] += 1;
      }
    }
  });
  return data;
};

export {
  connectDB,
  invalidateCache,
  reduceStock,
  calculatePercentage,
  getCategoryCount,
  getChartsData,
};
