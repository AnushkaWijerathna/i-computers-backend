import express from "express"// eliye thiyana express folder eken express function eka import krnwa
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import productRouter from "./routes/productRouter.js"

let app = express() // express eke thiyna fully furbished backend code eka (framework) app kiyla variable ekkta danwa

//let dala hadana variable aye change krnna puluwn, const dala hadana vairable change krnna  baa
const mongoURI =  "mongodb+srv://admin:1234@cluster0.ewkms58.mongodb.net/?appName=Cluster0" // MongoDB connection string eka

mongoose.connect(mongoURI).then(
    () => {
        console.log("Connected to MongoDB cluster")
    }
) // project ekai mongoDB cluster ekai connect krnwa

//middleware ekak hdwna...backend ekta ena request eke data piliwelata hadala ilngata labenna one thanta ynwa (ex:- http requst --> JSON)
app.use(express.json()) 

//User Authentication walata adala security middleware eka hdanwa
//"next" function eken req eka ilnga kenata direct forward krnwa
app.use(
    (req,res,next) => {
        
        //check if token is present in the header of the request,if present remove the "Bearer " part from the original token
        const authorizationHeader = req.header("Authorization")
        
        if (authorizationHeader != null) {
            
            const token = authorizationHeader.replace("Bearer ","")
         
            //Decrypting to verify the token (using "jwt.verify()"), third parameter is the arrow function(What to do if verified)
            //content has the user data encrypted in the token
            jwt.verify(token,"secretKey96$2025",
                (error,content) =>{
            
                    if (content == null) {
                        
                        console.log("Invalid Token")

                        res.json({
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

app.use("/users",userRouter)

app.use("/products",productRouter)

app.listen(5000, ()=> {
    console.log("Server running on port 5000");
})
