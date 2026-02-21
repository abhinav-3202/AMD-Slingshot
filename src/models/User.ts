import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender:{
        type: String,
        required: true,
    },
    height:{
        type: Number,
        required: true,
    },
    weight:{
        type: Number,
        required: true, 
    },
    age:{
        type: Number,
        required: true,
    },
    authProvider:{
        type:String,
        enum:["credentials","google"],
        required:true,
    },
})


const UserModel =  mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;