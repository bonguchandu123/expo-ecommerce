import express from "express"
import path from "path"
import { ENV } from "./config/env.js"

const app = express()
const __dirname = path.resolve()

app.get("/api/app",(req,res)=>{
    res.status(201).json({message:"hii there"})
})

if(ENV.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname,"../admin/dist")))

    app.get("/{*any}",(req,res)=>{
        res.sendFile(express.static(path.join(__dirname,"../admin","dist","index.html")))
    })
}

app.listen(3000,()=>{
    console.log("server is running")
})