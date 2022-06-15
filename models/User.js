const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    
    name:{
        type : String,
        required : [true, "please enter a name"]
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
        required : [true , "Please enter password"],
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
    }
   


},
{ timestamps: true })




const User = mongoose.model('User' , userSchema)

module.exports = User;