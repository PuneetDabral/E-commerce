import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getCategoryCount } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};
  if (myCache.has("admin-stats")) {
    stats = JSON.parse(myCache.get("admin-stats" as string));
  } else {
    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1),
      end: new Date(today.getFullYear(), today.getMonth() - 1, 0),
    };

    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthUsersPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const lastTransactionPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProduct,
      lastMonthProduct,
      thisMonthUser,
      lastMonthUser,
      thisMonthOrder,
      lastMonthOrder,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUserCount,
      lastTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      lastMonthProductsPromise,
      thisMonthUsersPromise,
      lastMonthUsersPromise,
      thisMonthOrdersPromise,
      lastMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.find({ gender: "female" }),
      lastTransactionPromise,
    ]);

    const thisMonthRevenue = thisMonthOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const lastMonthRevenue = lastMonthOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const count = {
      revenue,
      user: usersCount,
      product: productsCount,
      order: allOrders.length,
    };
    let orderMonthCounts = new Array(6).fill(0); // 6 months
    let orderMonthlyRevenue = new Array(6).fill(0); // 6 months

    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = today.getMonth() - creationDate.getMonth();
      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      user: calculatePercentage(thisMonthUser.length, lastMonthUser.length),
      product: calculatePercentage(
        thisMonthProduct.length,
        lastMonthProduct.length
      ),
      order: calculatePercentage(thisMonthOrder.length, lastMonthOrder.length),
    };

    const { categoryCount, categoriesCount } = await getCategoryCount(
      categories
    );

    const userRatio = {
      male: usersCount - femaleUserCount.length,
      female: femaleUserCount.length,
    };

    const modifyTransaction = lastTransaction.map((order) => {
      return {
        quantity: order?.orderItems.length,
        discount: order.discount,
        amount: order.total,
        status: order.status,
        _id: order._id,
      };
    });
    stats = {
      categoryCount,
      categories,
      categoriesCount,
      changePercent,
      count,
      charts: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userRatio,
      lastTransaction: modifyTransaction,
    };
    myCache.set("admin-stats", JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});
export const getPieCharts = TryCatch(async (req, res, next) => {
  let charts;

  if (myCache.has("admin-pie-charts"))
    charts = JSON.parse(myCache.get("admin-pie-charts" as string));
  else {
    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      outOfStock,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.countDocuments({ stock: 0 }),
      Order.find({}).select([
        "total",
        "discount",
        "subTotal",
        "tax",
        "shippingCharges",
      ]),
      User.find({}).select("dob"),
      User.countDocuments({role:"admin"}),
      User.countDocuments({role:"user"})
    ]);

    const orderFullfillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    let categories = await Product.distinct("category");
    const { categoryCount, productsCount } = await getCategoryCount(categories);

    const stockAvailability = {
      inStock: productsCount - outOfStock,
      outOfStock,
    };

    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = grossIncome * (30 / 100);

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const usersAgeGroup={
    teen:allUsers.filter((user)=> user.age<20 ).length,
    adult:allUsers.filter((user)=> user.age<40 && user.age > 20 ).length,
    old:allUsers.filter((user)=> user.age>=40 ).length,
    }
    charts = {
      orderFullfillment,
      productCategories: categoryCount,
      stockAvailability,
      revenueDistribution,
      usersAgeGroup,
      adminUsers,
      customerUsers
    };

    myCache.set("admin-pie-charts", JSON.stringify(charts));
  }
  return res.status(200).json({
    success: true,
    charts,
  });
});
export const getBarCharts = TryCatch(async () => {});
export const getLineCharts = TryCatch(async () => {});
