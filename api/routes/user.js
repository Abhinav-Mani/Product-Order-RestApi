const   express=require("express"),
        router=express.Router(),
        User=require("../models/User"),
        bcrypt=require("bcryptjs"),
        mongoose=require("mongoose"),
        jwt=require("jsonwebtoken");

router.post("/",(req,res,next)=>{
    
        User
        .find({email:req.body.email})
        .exec()
        .then(user=>{
            if(user.length>=1){
                res.status(409).json({message:"email already exists"})
            }
            else{
                bcrypt.hash(req.body.password,10,(err,hash)=>{
                    if(err){
                        res.status(500).json(err);
                    }else{
                        var user=new User({
                            _id:new mongoose.Types.ObjectId(),
                            email:req.body.email,
                            password:hash
                        })
                        return user.save()
                        .then(user=>{
                            res.status(201).json({user});
                        })
                        .catch(err=>res.status(500).json({err}));;
                    }
                })
                
            }
        })
        .catch(err=>res.status(500).json({err}));
    
})
router.post("/login",(req,res,next)=>{
    User
    .find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1)
        {
            res.status(401).json({
                message:"Auth Failed"
            })
        }
        else{
            let password=req.body.password;
            bcrypt.compare(password,user[0].password,(err,result)=>{
                if(err){
                    console.log(user+" "+password)
                    res.status(401).json({
                        message:"Auth Failed"
                    });
                }else if(result)
                {
                    let token=jwt.sign({
                        id:user[0]._id,
                        email:user[0].email
                    },process.env.JWT_KEY,{
                        expiresIn: "1h"
                    })
                    res.status(200).json({
                        token: token
                    })
                } else
                {
                    res.status(401).json({
                        message:"Auth Failed"
                    });
                }
            });
        }
    })
    .catch(err=>res.status(500).json({err}))
})
module.exports=router