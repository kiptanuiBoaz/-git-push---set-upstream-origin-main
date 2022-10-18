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

// api for obtanining user data ater logIn
app.post("/user-data", async(req,res)=>{
    const {token} =  req.body;
    // console.log(token);

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

// api for retrieving forgor password
app.post("/forgot-password", async (req,res)=>{
    const {email} = req.body ;

    try {
        const oldUser = await User.findOne({email});
        // checking if user with the email exist
        if (!oldUser) { 
            return res.json({status : "user not found"}); 
        }

        const secret = JWT_SECRET_KEY + oldUser.password
        const token = jwt.sign(
            {email:oldUser.email, id:oldUser._id},
            secret, 
            {expiresIn:"5m"}
        )
        const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
        console.log(link);
        
    } catch (error) {
        
    }
})

// api for authenticating  token from link
app.get("/reset-password/:id/:token", async (req, res)=>{
    //recieve tokena and id from link sent to user
    const {id, token} = req.params;

    const oldUser = await User.findOne({_id:id});
    const secret = JWT_SECRET_KEY + oldUser.password
    // checking if user with the email exist
    if (!oldUser) { 
        return res.json({status : "user not found"}); 
    }
    
    
    try {
        const  verify = jwt.verify(token, secret);
        verify && res.send({status : "verified"})
        // render (verified.email to the ui for reset of password)
    } catch (error) {
        res.send("Not verified")
    }



})

// api for actually resetting the user password
app.post("/reset-password/:id/:token", async (req, res)=>{
    //recieve tokena and id from link sent to user
    const {id, token} = req.params; //from link sent
    const {password} = req.body; //from the token recieved from ui


    const oldUser = await User.findOne({_id:id});
    const secret = JWT_SECRET_KEY + oldUser.password
    // checking if user with the email exist
    if (!oldUser) { 
        return res.json({status : "user not found"}); 
    }
    // encrypting the recieved password
   const encryptedPassword = await bcrypt.hash(password,10);
//    updating the password in the User model
   User.updateOne(
        {_id:id} ,//what to update
        {$set:{password:encryptedPassword}} //who to update

    )

    
    try {
        const  verify = jwt.verify(token, secret);
        res.send({status : "verified"})
        
    } catch (error) {
        res.send("Not verified")
    }

})


require("./userSchema");

const User = mongoose.model("userInfo",userDetailsSchema )

app.listen(PORT,()=> console.log(`server started on port ${PORT}`));