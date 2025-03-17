import express from "express";
import { newOrder,myOrders,allOrders, getSingleOrder, processOrder, deleteOrder } from "../controllers/order.js";
import { adminOnly } from "../middlewares/auth.js";


const app=express.Router();

app.post('/new',newOrder);

app.get("/my",myOrders)

app.get("/all",allOrders)

app.route('/:id').get(getSingleOrder).put(adminOnly,processOrder).delete(adminOnly,deleteOrder);




export default app;