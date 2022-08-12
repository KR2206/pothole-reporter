require('dotenv').config();
const express = require("express");
const app = express();
const ejs = require("ejs");

app.use(express.static(__dirname + '/public'));
app.set("view engine",'ejs');
const arr = ["gochi", "gang"]
app.get("/",function(req,res){
    //res.render("tweet",{handles:arr, link:"https%3A%2F%2Fwww.google.com%2Fmaps%2Fplace%2FFortis%2BHospital.%2F%4022.5499828%2C88.3785368%2C15z%2Fdata%3D%214m5%213m4%211s0x3a0277f15cc181b9%3A0xf6b86895953bf55c%218m2%213d22.5439494%214d88.3806109"});
    res.render("mail",{api:process.env.MAPS_API});
})

app.listen(3000,function(){
    console.log("Server started at port 3000");
})