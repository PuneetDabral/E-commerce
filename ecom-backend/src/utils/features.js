import mongoose from 'mongoose';


export const connectDb=async()=>{
    mongoose.connect("mongodb+srv://hiteshdabral03:hiteshdabral03@cluster0.cwxfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",{
        dbName:"E-commerce"
    }).then((c)=>console.log("Connected to DB")).catch((e)=>console.log(e));
}