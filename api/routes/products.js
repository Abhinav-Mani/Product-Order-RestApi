const   express= require("express"),
        router=express.Router(),
        Product=require("../models/product"),
        mongoose=require("mongoose"),
        multer=require("multer"),
        checkAuth=require("../middleware/check-auth");

const storage=multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'./uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,new Date().toISOString().replace(/:/g, '-')+""+file.originalname);
    }
});
const filefilter=(req,f,cb)=>{
    if(f.mimetype==='image/png'||f.mimetype==='image/jpg'||f.mimetype==='image/img')
    {
        cb(null,true);
    }
    else{
        cb(null,false);
    }
};
const upload=multer({ 
    storage     :   storage, 
    limits      :   {fileSize:1024*1024*5}
});
        
router.get("/",(req,res,next)=>{
    let response={}
    Product
    .find()
    .then(r=>{
        response.count=r.length;
        response.products=r.map((prod)=>{
            return{
                name:prod.name,
                price:prod.price,
                _id:prod._id,
                requests:{
                    type:"GET",
                    url:"http://localhost:3000/products/"+prod._id
                }
            }
        })
        res.send(response)
    })
    .catch(err=>res.send(err));
})

router.post("/",checkAuth,upload.single('productImage'),(req,res,next)=>{
    const product=new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        url:req.file.path
    });
    product.save().then(r=>
    res.status(200).json(
        {
            _id:r._id,
            name: r.name,
            price:r.price,
            url:"http://localhost:3000/"+r.url,
            requests:{
                type:"GET",
                url:"http://localhost:3000/products/"+r._id
            }
        }
        ))
    .catch(err=> res.status(500).json({err}));
})
router.get("/:id",(req,res,next)=>{
    id=req.params.id;
    Product.findById(id).select("name _id price").then(r=>res.status(200).json({
        ...r._doc,
        requests:{
            type:"GET",
            desc:"Get All Products",
            url:"http://localhost:3000/products"
        }
    }));
})
router.patch("/:id",(req,res,next)=>{
    let id=req.params.id;
    let updateOps={};
    for(let ops of req.body){
        updateOps[ops.propName]=ops.value;
    }
    console.log(updateOps);
    Product.update( {_id : id} , {$set:updateOps})
    .then(doc=>res.status(200).json({
        message:"Updated",
        requests:{
            type:"GET",
            url:"http://localhost:3000/products/"+id
        }
    }))
    .catch(err=>res.status(500).json(err));
})

router.delete("/:id",(req,res,next)=>{
    let id=req.params.id;
    Product.findByIdAndDelete(id)
    .then(r=>res.status(200).json({message:"Deleted"}))
    .catch(err=>res.status(500).json({err}))
})
module.exports = router