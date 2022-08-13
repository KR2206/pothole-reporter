require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const https = require("https");
const axios = require('axios').default;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

let arr = [];
let coords = {
  lat: 0,
  long: 0,
};
let state="";

app.get("/try",function(req,res){
    https.get("https://nominatim.openstreetmap.org/reverse?format=json&lat=22.607599&lon=88.431927",function(response){
        console.log(response.statusCode);
    })
})

app.get("/", function (req, res) {
  //res.render("tweet",{handles:arr, link:"https%3A%2F%2Fwww.google.com%2Fmaps%2Fplace%2FFortis%2BHospital.%2F%4022.5499828%2C88.3785368%2C15z%2Fdata%3D%214m5%213m4%211s0x3a0277f15cc181b9%3A0xf6b86895953bf55c%218m2%213d22.5439494%214d88.3806109"});
  arr = [];
  coords.lat = 0;
  coords.long = 0;
  state="";
  res.render("home");
});
app.get("/adjust", function (req, res) {
  res.render("adjust", { api: process.env.MAPS_API });
});

app.post("/", function (req, res) {
  // console.log(req.body);
  res.redirect("/adjust");
});
app.post("/adjust", function (req, res) {
  console.log(req.body);
  coords.lat = req.body.lat;
  coords.long = req.body.long;
  axios.get("https://nominatim.openstreetmap.org/reverse?",{
        params:{
            lat: coords.lat,
            lon: coords.long,
            format: "json"
        }
    })
    .then(function(response){
        console.log(response.data.address.state);
        state = response.data.address.state;
    })
    .catch(function(error){
        console.log(error);
    })
});

app.listen(3000,function(){
    console.log("Server started at 3000");
})