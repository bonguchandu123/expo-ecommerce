import express from "express"

const app = express()

app.get("/api/app",(req,res)=>{
    res.status(201).json({message:"hii there"})
})

app.listen(3000,()=>{
    console.log("server is running")
})