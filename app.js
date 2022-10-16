const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = "*@&@0q08qglf)&#)({}NA>CVP04q0790^5tW%@%Esnfnnfljkgshr04090&%%9860WY"


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

// registering api

app
    .post("/register", async (req, res)=>{

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
});

// logIn api
app.post ("/login",async(req,res) =>{
    // accesing the user credientials from UI form
    const {email,password} = req.body;
   // checking wether the user with the emeail exists in db
    const user = await User.findOne({email});

    if(!user) { return res.json({error:"User with this email not found"}); } 
    // comparing the password from user with that from db
    if (await bcrypt.compare(password, user.password)){
        // generating web token with random string
        const token = jwt.sign({email:user.email},JWT_SECRET_KEY);

        if(res.status(201)){
            return res.json({status:"ok", data:token})
        }

        else{
            return res.json({error:"error"})
        }
    }

    res.json({statue:"error" , error:"invalid password"});
})

app.post("/user-data", async(req,res)=>{
    const {token} =  req.body;
    console.log(token);

    try {
        // checking if token is valid
        const user = jwt.verify(token, JWT_SECRET_KEY);
        const useremail = user.email;
        // finding the user in the db using email
        User.findOne({email:useremail})
            .then((data)=>{
                // returnig the data of user to the clinet side
                res.send({status:"ok",data:data})
            })

            .catch((err)=>{
                // returnig the error if the user is not found
                res.send({status:"error",data:err})
            })

    } catch (error) {
        res.send({status:"error",data:error})
    }
})

require("./userSchema");

const User = mongoose.model("userInfo",userDetailsSchema )

app.listen(PORT,()=> console.log(`server started on port ${PORT}`));