import { verify } from "crypto";
import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
    },
    password: {
        type: String,
        required: function () {
        return this.authProvider === "credentials";
        },
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    verifyCodeExpiry:{
        type:Date,
    },
    verifyCode:{
        type:String,
    },
    authProvider:{
        type:String,
        enum:["credentials","google"],
        required:true,
    },
})


const UserModel =  mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;