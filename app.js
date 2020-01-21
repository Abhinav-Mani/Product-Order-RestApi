const express= require('express'),
        app=express(),
        productRoutes=require("./api/routes/products"),
        orderRoutes=require("./api/routes/order"),
        morgan=require("morgan"),
        bodyParser=require("body-parser"),
        user=require("./api/routes/user"),
        mongoose=require("mongoose");
        
mongoose.connect("mongodb://localhost:27017/Node-App",
        {
        useNewUrlParser: true,
        useUnifiedTopology: true
     }).then(res=>console.log("Connection Established")).catch(error=>console.log(error));
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Header',"Origin,X-Requested-With,Content-Type,Accept,Authorization");
    if(req.method==='OPTIONS'){
        req.header('Access-Conrol-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({})
    }
    next();
})
app.use("/uploads/",express.static("uploads"))
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use("/user",user);
app.use("/products",productRoutes);
app.use("/orders",orderRoutes);

app.use((req,res,next)=>{
    const error = new Error("Not Found");
    error.status= 404;
    next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        error:{
            messege: error.message
        }
    })
})

module.exports = app;