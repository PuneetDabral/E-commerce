import { TryCatch } from "../middlewares/error.js";
import { Request } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingCharges,
      orderItems,
      user,
      subTotal,
      tax,
      shippingInfo,
      discount,
      total,
    } = req.body;

    if (
      !shippingCharges ||
      !orderItems ||
      !user ||
      !subTotal ||
      !tax ||
      !total
    ) {
      return next(new ErrorHandler("Please Enter All Fields", 400));
    }
    await Order.create({
      shippingCharges,
      orderItems,
      user,
      subTotal,
      tax,
      shippingInfo,
      discount,
      total,
    });

    await reduceStock(orderItems);

    invalidateCache({ order: true, product: true, admin: true });

    res.status(201).json({
      success: true,
      message: "Order Places Successfully",
    });
  }
);

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;
  const key = `my-orders-${user}`;
  let orders = [];
  if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
  else {
    orders = await Order.find({ user });
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});


export const allOrders = TryCatch(async (req, res, next) => {
  const key = `all-orders`;
  let orders = [];
  if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
  else {
    orders = await Order.find().populate('user',"name");
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});
