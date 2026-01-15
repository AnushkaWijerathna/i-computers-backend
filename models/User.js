import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            required : true,
            unique : true
        },
        firstname :{ 
            type : String,
            required : true
         },
        lastname :{ 
            type : String,
            required : true
        },
        password : {
            type : String,
            required : true
        },
        role : {
            type : String,
            default : "customer"
        },
        isBlock : {
            type : Boolean,
            default : false
        }, // requirenments wla thiyenwa custormers block krnna puluwn wenna one kiyla...Block krnna one nm isBlock eka true kranna one

        isEmailVerified : {
            type : Boolean,
            default : false
        },
        Image : {
            type : String,
            required : true,
            default : "/default.jpg" //default dena photo eka
        }
    }
)

//User collection ekai user model ekai athara connection eka thiyaganna one wena mongoose model eka
const User = mongoose.model("User",userSchema);

export default User;