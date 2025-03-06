import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true,"Please enter name"] },
  category: { type: String, required: [true,"Please enter category"],trim:true },
  price: { type: Number, required: [true,"Please enter price"] },
  stock: { type: Number, required: [true,"Please enter stock"] },
  photo: { type: String, required: [true,"Please enter photo"] },
},{
    timestamps:true
})

export const Product = mongoose.model("Product", productSchema)