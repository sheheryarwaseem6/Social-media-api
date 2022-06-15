const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    
    name:{
        type : String,
        required : false
    },
    profilePicture:{
        type: String,
        default : null
    },

    email : {
        type: String,
        required : [true, " please enter email"],
        unique: [true, "Email already exist"]
    },
    password:{
        type: String,
        required : false,
        select : false
        
    },
    posts :[{
        
        type : mongoose.Schema.Types.ObjectId,
        ref : "Post"
    
    }],
    followers :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    following:[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    
    code: {
        type: Number,
        default: null
    },
    verified: {
        type: Number,
        default: 0
    },
    user_social_token :{
        type : String,
        required : false
    },
    user_social_type:{
        type : String,
        required : false
    },
    user_device_type:{
        type : String,
        required : false
    },
    user_device_token:{
        type : String,
        required : false
    }
   


},
{ timestamps: true })


userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_KEY);
    // user.user_authentication = token;
    await user.save();
    //console.log("tokeeen--->", token);
    return token;
}

const User = mongoose.model('User' , userSchema)

module.exports = User;