const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const MONGO_URI = "mongodb+srv://adwaidpaloli01:bisKBN4I7DsPjSXj@cluster0.60zvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const userSchema = new mongoose.Schema({
    name:{type : String, required:true},
    email: {type : String, required : true, unique: true},
    password: {type : String, required: true},
})

const User = mongoose.model('User',userSchema);

mongoose.connect(MONGO_URI)
    .then(()=> console.log("MongoDb connected"))
    .catch(err => console.log(err))

app.post('/api/register', async (req,res)=>{
    const {name,email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    
    try {
        const newUser = await User.create({name, email, password : hashedPassword})
        res.status(201).send({message:"User Registered Successfully"})
    } catch (err) {
        res.status(400).send({error : "User is already exists"})
    }
})

app.post('/api/login', async(req,res)=>{
    const {name, email,password} = req.body;
    const user = await User.findOne({email})
    if(!user) return res.status(400).send({message : "User not found"})
    
    const isValidPassword = await bcrypt.compare(password,user.password)
    if(!isValidPassword) return res.status(400).send({error : "Password is incorrect"})

    const token = jwt.sign({ userId: user._id}, 'secret_key',{ expiresIn : "1h"})
    res.status(200).send({message : "Login successfull", token})
})

// app.get('/',(req,res)=>{
//     res.send("<h1>Index Page</h1>")
// })

app.listen(5000,()=> console.log("Server running..."))