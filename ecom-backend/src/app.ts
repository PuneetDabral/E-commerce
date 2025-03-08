import express, { NextFunction } from "express"
import {connectDB} from "./utils/features.js"
import userRoute from "./routes/user.js"
import productsRoute from "./routes/products.js"
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";

// routes import

connectDB();
export const myCache=new NodeCache({stdTTL: 100, checkperiod: 120});
const app = express();
app.use(express.json());


app.use('/api/v1/user', userRoute)

app.use('/api/v1/product',productsRoute)

app.use("/uploads", express.static("uploads"));



app.use(errorMiddleware)

app.listen(4000, () => {
    console.log("Server is running on port 4000")
})
