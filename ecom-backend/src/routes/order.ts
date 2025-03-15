import express from "express";
import { newOrder,myOrders,allOrders } from "../controllers/order.js";


const app=express.Router();

app.post('/new',newOrder);

app.get("/my",myOrders)

app.get("/all",allOrders)




export default app;