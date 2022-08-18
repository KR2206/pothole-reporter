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

let handles;
let mails;
let coords = {
  lat: 0,
  long: 0,
};
let chosenState;
const password = process.env.PASSWORD;
const mongoURL = process.env.MONGOURL;
const map_url = "https://www.google.com/maps/search/?api=1&query="


//--------------GET REQUESTS---------------------
app.get("/", function (req, res) {
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

    

    State.findOne({state: chosenState},function(err,doc){
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
  let completeURL = "https%3A%2F%2Fwww.google.com%2Fmaps%2Fsearch%2F%3Fapi%3D1%26query%3D"+coords.lat+"%2C"+coords.long;
  res.render("tweet",{handles:handles,link:completeURL});
})
app.get("/thanks",function(req,res){
  res.render("thanks");
})


//--------------POST REQUESTS ----------------------------------
app.post("/", function (req, res) {
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
      subject: "Reporting a pothole on a road under your jurisdiction",
      text: "Dear Sir/Madam,\nThis mail has been sent to you to make you aware about potholes appearing on a road under your jurisdiction. As you may be aware, potholes are extremely dangerous and may cause serious accidents if not filled at the earliest. Hence I request you to kindly look into this issue and mobilise concerned authorities to fill it up quickly. The google map link is given below for reference and is accurate about where the pothole is located\n\nLink:-"+map_url+coords.lat+"%2C"+coords.long+"\n\nThanking You,\nYours truly,\nA concerned citizen\nPlease dont reply to this mail as it is an automated message",
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