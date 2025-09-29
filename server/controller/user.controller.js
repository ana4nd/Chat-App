import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.model.js";
import cloudinary from "../lib/cloudinary.js";

// Sign Up new User
export const signUp = async(req, res)=>{
    const {fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio){
            res.json({
                success: false,
                message: "All fields are required"
            })
        }

        const user = await User.findOne({email});

        if(user){
            res.json({
                success: false,
                message: "Account already exists"
            })
        }

        const salt = await bcrypt.getSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });


        const token = generateToken(newUser._id);

        res.json({
            success: true,
            userData: newUser,
            token,
            message: "Account Created Successfully"
        })



    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })

        console.log(error.message);
    }
}

// Login 

export const login = async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        res.json({
            success: false,
            message: "Incorrect email or password"
        })
    }

    try {
        const user = await User.findOne({email});

        if(!user){
            res.json({
                success: false,
                message: "User not found"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.json({
                success: false, 
                message: "Invalid Credentials"
            })
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            user,
            token,
            message: "Login Successfully",
        })

    } catch (error) {
        res.json({
                success: false, 
                message: error.message
        })
        console.log(error.message);
    }
}

//Controller to check if user is authenticated or not

export const checkAuth = ()=>{
    res.json({
        success: true,
        user: req.user
    })
}

// Controller to update user profile details

export const updateProfile = async(req, res)=>{
    try {
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user;

        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        }
        else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }
        

        res.json({
            success: true,
            user: updatedUser
        })


    } catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            user: error.message
        })
    }
}