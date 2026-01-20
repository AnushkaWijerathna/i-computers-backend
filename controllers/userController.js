import User from "../models/User.js";
import bcrypt from "bcrypt"; //Hashing walata gnna import eka
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function createUser(req,res){
    
    const data = req.body

    //password hashing = eka krnne "hashSync" use krla
    const hashedPassword = bcrypt.hashSync(data.password, 10) //api dena password eka 10 wathwak hash krnwa (db eke save krnna klin)
    
    const user = new User({ //User kiyna model eke okkoma data hariyta fill krpu aluth User object ekk hadanwa..ee object eka "user" variable eke save krnwa
        email : data.email,
        firstname : data.firstname,
        lastname : data.lastname,
        password : hashedPassword,
        role : data.role
    })

    //Okkoma details hariyta dapu "user" object eka db eke save krnwa
    user.save().then(
        () => {
            res.json({
                message : "User created successfully"
            })
        }
    )
}

export function loginUser(req,res) {

    //login wenna nm one correct password and email one...ee deka check krna part eka me
    const { email,password } = req.body

    //apita dena email ekata samana email thiyenawada kiyala check krnwa, 
    // Pass unoth ee adala "User" model eka (Mongoose Model connected to the users collection) return krnwa
    User.find({ email : email }).then(

        //users is an object of mongoose model called User, if email exist the object is returned..this object is an array
        (users) => { 

            if(users[0] == null){
                res.json({
                    message : "User not found"
                })
            }
            
            else{
                const user = users[0] //two user variables are: In different functions In different scopes Do NOT conflict with each other

                //password compare krnne "compareSync" use krla
                const isPasswordCorrect = bcrypt.compareSync(password,user.password) //"user.passsword" kiynne database eke save krpu PW eka

                if (isPasswordCorrect) {
                    
                    //JSON web token eka kiynne user ge ID card eka wage, eka use krla userge authentication,authorization process eka wenwa
                    //user ge data tika thiyena token ek hdanna onewena content eka hadaggnwa (payload)
                    //passe user data dapu token eka hdala eka encrypt krnwa ("jwt.sign()"), token eka encrypt krnna encryption key eka "secretKey96$2025" kiyla denwa

                    const payload = {
                        email : user.email,
                        firstname : user.firstname,
                        lastname : user.lastname,
                        role : user.role,
                        isEmailVerified : user.isEmailVerified,
                        Image : user.Image
                    };

                    const token = jwt.sign(payload,process.env.JWT_SECRET,{
                        expiresIn : "150h"
                    })
                    
                    
                    res.json({
                        message : "Login Successfull",
                        token : token,
                        role : user.role
                    })
                }
                else{
                    res.status(401).json({
                    message : "Incorrect password"
                    })
                }
            }
        }
    )
}

export function isAdmin(req) {
    if (req.user == null) {
    
        return false
    }

    if (req.user.role != "admin") {
       
        return false
    }

    return true
}