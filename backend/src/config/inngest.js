import {Inngest} from "inngest"
import { connectDB } from "./db.js"
import {User} from "../models/user.model.js"

export const inngest = new Inngest({id:"expo-ecommerce"})

const syncUser = inngest.createFunction(
    {id:"cler-user-id"},
    {event:"clerk/user.created"},

    async ({event})=>{
        await connectDB()
        const {email_address,first_name,last_name,image_url,id} = event.data


        const newUser = {
            clerkId:id,
            email:email_address,
            name:`${first_name || ""} ${last_name || ""}`,
            imageUrl:image_url,
            addresses:[],
            wishlist:[]
        }

        await User.create(newUser)
    }
);

const deleteUserFromDB = inngest.createFunction(
    {id:"cler-user"},
    {event:"clerk/user.deleted"},

    async({event})=>{
        await connectDB()

        const {id} = event.data

        await User.deleteOne({clerkId:id})
    }
)




export const functions = [syncUser,deleteUserFromDB]