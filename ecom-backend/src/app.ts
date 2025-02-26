import express, { NextFunction } from "express"
import {connectDB} from "./utils/features.js"
import userRoute from "./routes/user.js"
import { errorMiddleware } from "./middlewares/error.js";

// routes import

connectDB();
const app = express();
app.use(express.json());


app.use('/api/v1/user', userRoute)


app.use(errorMiddleware)

app.listen(4000, () => {
    console.log("Server is running on port 4000")
})
