import express from "express"
import path from "path"
import { clerkMiddleware } from '@clerk/express'
import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"

const app = express()
const __dirname = path.resolve()

app.use(clerkMiddleware())

app.get("/api/app",(req,res)=>{
    res.status(201).json({message:"hii there"})
})

if(ENV.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname,"../admin/dist")))

    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../admin","dist","index.html"))
    })
}

app.listen(3000,()=>{
    console.log("server is running")
    connectDB()
})