require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const axios = require('axios').default;
const mongoose = require("mongoose");
const nodeoutlook = require("nodejs-nodemailer-outlook");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
const stateList = ["Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];

const stateSchema = new mongoose.Schema({
  state: String,
  emails: [String],
  handles: [String]
})
const State = mongoose.model("state",stateSchema);

let handles = ["multiversus","amongus"];
let mails = ["a@b.com","b@c.com"];
let coords = {
  lat: 0,
  long: 0,
};
let chosenState="Telangana";
const password = process.env.PASSWORD;
let mongoURL = process.env.MONGOURL

//--------------GET REQUESTS---------------------
app.get("/", function (req, res) {
  //res.render("tweet",{handles:handles, link:"https%3A%2F%2Fwww.google.com%2Fmaps%2Fplace%2FFortis%2BHospital.%2F%4022.5499828%2C88.3785368%2C15z%2Fdata%3D%214m5%213m4%211s0x3a0277f15cc181b9%3A0xf6b86895953bf55c%218m2%213d22.5439494%214d88.3806109"});
  handles = [];
  coords.lat = 0;
  coords.long = 0;
  chosenState="";
  res.render("home");
});

app.get("/adjust", function (req, res) {
  res.render("adjust", { api: process.env.MAPS_API });
});

app.get("/confirm",function(req,res){
  mongoose.connect(mongoURL,{ useNewUrlParser: true });

    

    State.findOne({state: "test"},function(err,doc){
        if(err){
            console.log(err);
        }
        else{
            if(doc===null){
                console.log("Empty");
            }
            else{
                console.log(doc);
                mails = doc.emails;
                handles = doc.handles;
                res.render("confirm",{state:chosenState,mails:mails});
            }
        }
    })
  
})

app.get("/err",function(req,res){
  res.render("err",{allStates:stateList});
})

app.get("/tweet",function(req,res){
  res.render("tweet",{handles:handles,link:"google.com"});
})
app.get("/thanks",function(req,res){
  res.render("thanks");
})


//--------------POST REQUESTS ----------------------------------
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
        if(typeof(response.data.address.state)==="string"){
          console.log(response.data.address.state);
          console.log(typeof(response.data.address.state));
          chosenState = response.data.address.state;
          res.redirect("/confirm");
        }
        else{
          console.log(response.data.address.state);
          console.log(typeof(response.data.address.state));
          res.redirect("/err");          
        }
    })
    .catch(function(error){
        console.log(error);
    })
});

app.post("/confirm",function(req,res){
  if(req.body.btn==="yes"){
    console.log("Amongus");
    nodeoutlook.sendEmail({
      auth: {
          user: "potholereporter@outlook.com",
          pass: password
      },
      from: "potholereporter@outlook.com",
      to: mails,
      subject: "Test",
      text: "Hello\nnice",
      onError: (e) => console.log(e),
      onSuccess: (i) => console.log(i)

  })
  }
  res.redirect("/tweet");
})

app.post("/err",function(req,res){
  chosenState = req.body.state;
  res.redirect("/confirm");
})

app.listen(3000,function(){
    console.log("Server started at 3000");
})