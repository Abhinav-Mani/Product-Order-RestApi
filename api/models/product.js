const mongoose=require("mongoose");

const ProductSchema=mongoose.Schema({
    _id:   mongoose.Schema.Types.ObjectId,
    name:  {type:String,required:true},
    price: {type:Number,required:true},
    url:{type:String,required:true}
})

const ProductModel=mongoose.model("Product",ProductSchema);

module.exports = ProductModel;