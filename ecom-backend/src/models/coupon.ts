import mongoose from "mongoose";

const couponSchema=new mongoose.Schema({
code:{
    type:String,
    required:[true,"Please enter the coupon code"],
    unique:true
},
amount:{
    type:Number,
    required:[true,"Please enter the discounted amount"]
}
})



export const Coupon=mongoose.model("Coupon",couponSchema)