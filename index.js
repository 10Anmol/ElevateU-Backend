import express from "express";
import cookieParser from "cookie-parser";//browser me jo cookie hai usko backend me use karne ke liye
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js"
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"

const app= express();
dotenv.config({});

// app.get("/home",(req,res)=>{
//     return res.status(200).json({
//         message:"I am comming form vackend",
//         success:true
//     })
// })



//middelware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions={
    origin:'http://localhost:5173',//jo frontend use kareghe vo react vichrte hai uska localhopst 5173 hota hai ye hota haui
    credentials:true
}
app.use(cors(corsOptions));

const PORT=process.env.PORT|| 3000;


app.use("/api/v1/user",userRoute);
app.use("/api/v1/company",companyRoute);
app.use("/api/v1/job",jobRoute);
app.use("/api/v1/application",applicationRoute);

app.listen(PORT,()=>{
    connectDB();
    console.log(`server i srunning at ${PORT}`)
})