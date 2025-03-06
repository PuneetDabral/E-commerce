import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;

    if (!name || !category || !price || !stock) {
      rm(photo?.path, () => {
        console.log("Deleted");
      });

      return next(new ErrorHandler("Please fill all the fields", 400));
    }

    if (!photo) return next(new ErrorHandler("Please upload a photo", 400));
    await Product.create({
      name,
      category: category.toLowerCase(),
      price,
      stock,
      photo: photo?.path,
    });

    res.status(200).json({
      success: true,
      message: "product Created Successfully",
    });
  }
);

export const getLatestProducts = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({
      success: true,
      products,
    });
  }
);

export const getAllCategories = TryCatch(async (req, res, next) => {
  const categories = await Product.distinct("category");
  res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  const categories = await Product.distinct("category");
  res.status(200).json({
    success: true,
    categories,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = TryCatch(
  async (
    req: Request<{ id: string }, {}, NewProductRequestBody>,
    res,
    next
  ) => {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    const photo = req.file;

    const product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product not found", 404));

    if (photo) {
      rm(product.photo!, () => {
        console.log("Old photo deleted");
      });
      product.photo = photo.path;
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (price) product.price = price;
    if (stock) product.stock = stock;

    await product.save();
    return res.status(201).json({
      success: true,
      message: "Product Updated Successfully",
    });
  }
);

export const deleteProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  rm(product.photo!, () => {
    console.log("Old photo deleted");
  });

  await Product.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price) baseQuery.price = { $lte: Number(price) };
    if (category) baseQuery.category = category;
    const productsPromise =  Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredProduct.length / limit);
    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
