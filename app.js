const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors")
const bcrypt = require("bcryptjs");


app.use(cors());
app.use(express.json());
PORT = 5000;

// connection to Mongo Atlas
const mongoUrl = "mongodb+srv://boaz:Serem3636@cluster0.8uqt73l.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(mongoUrl, { useNewUrlParser: true,})

    .then(()=> console.log("Connected to database"))

    .catch(()=>console.error("error in db"))

;

app.post("/register", async (req, res)=>{

    const {fname,lname,email,password}  = req.body;

    const bcrptedPassword = await bcrypt.hash(password,10);

    try{
        // find if user with same email already exists in DB
        const oldUser = await User.findOne({email});

        if(oldUser) { return res.json({error:"User with same email already exists"}); }   

        !oldUser && await User.create({fname,lname,email,password:bcrptedPassword});
        res.send({status:"ok"})
    }

    catch(err){
        res.send({status:err})
    }
})

require("./userSchema");

const User = mongoose.model("userInfo",userDetailsSchema )

app.listen(PORT,()=> console.log(`server started on port ${PORT}`));