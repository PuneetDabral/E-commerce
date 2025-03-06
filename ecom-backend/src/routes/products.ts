import express from "express";
import {newProduct,getLatestProducts,getAllCategories,getAdminProducts,getSingleProduct, updateProduct, deleteProduct, getAllProducts} from "../controllers/product.js"
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";


const app=express.Router();

app.post('/new',singleUpload,newProduct);

app.get('/all',getAllProducts);

app.get('/latest',getLatestProducts)

app.get('/categories',getAllCategories)

app.get('/admin-products',getAdminProducts)

app.route('/:id').get(getSingleProduct).put(singleUpload,updateProduct).delete(deleteProduct)

// app.get('/categories')


export default app;