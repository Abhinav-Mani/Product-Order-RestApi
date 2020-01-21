const   express= require("express"),
        router=express.Router(),
        mongoose=require("mongoose"),
        Order=require("../models/Order"),
        Products=require("../models/product");


router.get("/",(req,res,next)=>{
    Order
    .find()
    .exec()
    .then(doc=>res.status(200).json({
        count:doc.length,
        orders: doc.map(order=>{
           return({  _id:order._id,
                    quantity:order.quantity,
                    product:order.product,
                    requests:{
                        type:"GET",
                        url:"http://localhost:3000/orders/"+order._id
                    }
           })
        })
    }))
    .catch(err=>res.status(500).json(err))

})

router.post("/",(req,res,next)=>{
    const order=new Order({
        _id:mongoose.Types.ObjectId(),
        quantity:req.body.quantity,
        product:req.body.productId
    });
    let productId=req.body.p
    Products
    .findById(req.body.productId)
    .exec()
    .then(product=>{
        if(!product)
        {
            res.status(400).json({
                messege:"Cannot Find Product"
            })
        }
        return order.save();
    }).then(doc=>res.status(201).json(doc))
    .catch(err=>res.status(500).json(err))
    
})
router.get("/:id",(req,res,next)=>{
    let id=req.params.id;
    Order
    .findById(id)
    .populate('product',"name price")
    .exec()
    .then(doc=>res.status(200).json({
        ...doc._doc,
        requests:{
            method:"GET",
            desc:"All Orders",
            url:"http://localhost:3000/orders"
        }
    }))

})

router.delete("/:id",(req,res,next)=>{
    let id=req.params.id;
    Order
    .findByIdAndDelete(id)
    .exec()
    .then(result=>{
        res.status(204).json({
            messege:"Removed order"+id,
            requests:{
                method:"GET",
                url:"http://localhost:3000/orders",
                desc:"To get all orders"
            }
        })
    }).catch(err=>res.status(400).json(err.messege))
})

router.patch("/:id",(req,res,next)=>{
    let id=req.params.id;
    Order
    .findByIdAndUpdate(id,{quantity:req.body.quantity})
    .exec()
    .then(order=>res.status(201).json({
        _id:order._id,
        product:order.product,
        quantity:req.body.quantity,
        requests:{
            method:"GET",
            url:"http://localhost:3000/orders/"+id
        }
    }))
    .catch(err=>res.status(400).json({err}))
    
})
module.exports = router