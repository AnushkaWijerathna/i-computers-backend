import express from "express"// eliye thiyana express folder eken express function eka import krnwa
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import productRouter from "./routes/productRouter.js"
import cors from 'cors';
import dotenv from "dotenv";

const app = express() // express eke thiyna fully furbished backend code eka (framework) app kiyla variable ekkta danwa

 // .env file eke thiyana environment variables load krnwa
dotenv.config();

const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI).then(
    () => {
        console.log("Connected to MongoDB cluster")
    }
) // project ekai mongoDB cluster ekai connect krnwa

//middleware ekak hdwna...backend ekta ena request eke data piliwelata hadala ilngata labenna one thanta ynwa (ex:- http requst --> JSON)
app.use(express.json()) 

// Enable CORS for all routes (Allow requests from different origins/ports)
//CORS policy --> Katawth enna denne na block krnwa, policy eka disable krnna one Frontend ekta backend API call krnna
app.use(cors()); 




//User Authentication walata adala security middleware eka hdanwa
//"next" function eken req eka ilnga kenata direct forward krnwa
/*  /login, /register → public
    /products, /orders, /admin → protected
    JWT middleware should guard only protected routes*/

app.use(
    (req,res,next) => {
        
        //check if token is present in the header of the request,if present remove the "Bearer " part from the original token
        const authorizationHeader = req.header("Authorization")
        
        if (authorizationHeader != null) {
            
            const token = authorizationHeader.replace("Bearer ","")
         
            //Decrypting to verify the token (using "jwt.verify()"), third parameter is the arrow function(What to do if verified)
            //content has the user data encrypted in the token
            jwt.verify(token,process.env.JWT_SECRET,
                (error,content) =>{
            
                    if (content == null) {
                        
                        console.log("Invalid Token")

                        res.status(401).json({
                            message : "Invalid Token"
                        })
                    } else {

                        //User wa authenticate unanm user data ilnga ewata forward krnwa
                        //👉 "req.user" Mulinma apu encoded data tika decode krla, ee "user" object ekema dala ilnga kenata ywnwa     
                        req.user = content  
                        next()

                    }
                }
            )
        }
        //Invalid to9ken block krnwa udin but token ekk nttn (ex: signUp process) eywth forward krnwa
        else{
            next()
        }
    }
)

app.use("/api/users",userRouter)

app.use("/api/products",productRouter)

app.listen(5000, ()=> {
    console.log("Server running on port 5000");
})
