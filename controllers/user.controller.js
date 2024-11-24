import {User} from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

//REGISTER
export const register= async(req,res)=>{
    try {
        const {fullname,email,phoneNumber,password,role}=req.body;
        if(!fullname || !email || !phoneNumber || !password || !role){
            return res.status(400).json({
                message:"something is missing",
                success:false
            });
        };

        const file= req.file;
        const fileUri= getDataUri(file);
        const cloudResponse=await cloudinary.uploader.upload(fileUri.content);


        //checkl kaar email pehle se to nahi exsist karti 
        const user=await User.findOne({email});
        if(user){
            return res.status(400).json({
                message:"email already exsist",
                success:false
            })
        }

        //pass hash kaar
        const hashedPassword= await bcrypt.hash(password,10);
        await User.create({
            fullname,
            email,
            phoneNumber,
            password:hashedPassword,
            role,
            profile:{
                profilePhoto:cloudResponse.secure_url
            }
        });

        return res.status(201).json({
            message:"Account created",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

//LOGIN
export const login=async (req,res)=>{
    try {
        const {email,password,role}=req.body;
        if(!email || !password || !role){
            return res.status(400).json({
                message:"something is missing",
                success:false
            });
        };
        let user= await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"email or password is incorrect",
                success:false
            })
        }
        const isPasswordMatch= await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message:"Incorrect email or password",
                success:false
            })
        };

        if(role != user.role){
            return res.status(400).json({
                message:"Account doesnt exsist ",
                success:false
            })
        }
        const tokenData={
            userId:user._id
        }
        const token=await jwt.sign(tokenData,process.env.SECRET_KEY,{expiresIn:'1d'});
        user={
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            phoneNumber:user.phoneNumber,
            role:user.role,
            profile:user.profile,

        }
        return res.status(200).cookie("token",token,{maxAge:1*24*60*60*1000,httpsOnly:true,sameSite:'Strict'}).json({
            message:`Welcome back ${user.fullname}`,
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}


export const logout=async (req,res)=>{
    try {
        return res.status(200).cookie("token","",{maxAge:0}).json({
            message:"Log out success",
            seccess:true
        })
    } catch (error) {
        console.log(error); 
    }
}


export const updateProfile=async (req,res)=>{
    try {
        const {fullname,email,phoneNumber,bio,skills}=req.body;
        const file=req.file;


        // const fileUri=getDataUri(file);
        // const cloudResponse = await cloudinary.uploader.upload(fileUri.content);



        // if(!fullname || !email || !phoneNumber || !bio || !skills){
        //     return res.status(400).json({
        //         message:"something is missing",
        //         success:false
        //     });
        // };


        //cloudinary ayega edhar
        let skillsArray;
        if(skills){
            skillsArray=skills.split(",");
            
        }
        const userId=req.id; //middle ware authen
        let user = await User.findById(userId);

        if(!user){
            return res.status(400).json({
                message:"User not found",
                success:false
            })
        }
        
        if(fullname) user.fullname=fullname;
        if(email) user.email=email;
        if(phoneNumber) user.phoneNumber=phoneNumber;
        if(bio) user.profile.bio=bio;
        if(skills) user.profile.skills=skillsArray;
        // if(fullname) user.fullname=fullname;

        // user.fullname=fullname,
        // user.email=email,
        // user.phoneNumber=phoneNumber,
        // user.profile.bio=bio,
        // user.profile.skills=skillsArray
        
        // if(cloudResponse){
        //     user.profile.resume=cloudResponse.secure_url
        //     user.profile.resumeOrignalName=file.orignalname
        // }


        await user.save()


        user={
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            phoneNumber:user.phoneNumber,
            role:user.role,
            profile:user.profile,

        }

        return res.status(200).json({
            message:"profile upadted",
            user,
            seccess:true
        })
 
    } catch (error) {
        console.log(error);
    }
}