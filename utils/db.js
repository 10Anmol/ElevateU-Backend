import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config({});


const connectDB=async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongo connect success");
    } catch (error) {
        console/log(error);
    }
}
export default connectDB;