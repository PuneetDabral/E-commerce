import express from "express"
import connectDb from "./utils/features.js"

// routes import

const app = express();
app.use(express.json());

connectDb();
app.get('/',(req,res)=>{
    res.send("Hello World")
})

app.listen(4000, () => {
    console.log("Server is running on port 4000")
})
