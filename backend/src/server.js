import express from "express"
import path from "path"
import cors from "cors"
import { serve } from "inngest/express";
import { clerkMiddleware } from '@clerk/express'
import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"
import { inngest ,functions} from "./config/inngest.js";
import adminRoutes from "./routes/admin.route.js"
import userRoutes from "./routes/user.route.js"
import orderRoutes from "./routes/order.route.js"
import reviewRoutes from "./routes/review.router.js"
import productRoutes from "./routes/product.router.js"
import cartRoutes from "./routes/cart.route.js";


const app = express()
const __dirname = path.resolve()

app.use(express.json())
app.use(clerkMiddleware())
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use(cors({origin:ENV.CLIENT_URL , credentials:true}))

app.use("/api/admin",adminRoutes)
app.use("/api/users",userRoutes)
app.use("/api/orders",orderRoutes)
app.use("/api/reviews",reviewRoutes)
app.use("/api/products",productRoutes)
app.use("/api/cart",cartRoutes)


app.get("/api/app",(req,res)=>{
    res.status(201).json({message:"hii there"})
})

if(ENV.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname,"../admin/dist")))

    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../admin","dist","index.html"))
    })
}

const startServer = async ()=>{
    await connectDB()
    app.listen(3000,()=>{
    console.log("server is running")
})
}
startServer()