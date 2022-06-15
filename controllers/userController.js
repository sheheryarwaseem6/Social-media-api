
const {hash} = require ('bcrypt')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require ('../models/User')
const Post = require('../models/Post')
const { sendEmail } = require('../config/mailer')

//register user

const register = async(req,res) =>{
        if(!req.body.name){
            res.status(400).send({
                status : 0,
                message : "name is required"
            })
        }
        else if(!req.body.email){
            res.status(400).send({
                status : 0,
                message : "email is required"
            })
        }
        else if(!req.body.password){
            res.status(400).send({
                status : 0,
                message : "password is required"
            })
        }
        else{
            User.find({email : req.body.email})
            .exec()
            .then(user =>{
                if(user.length >= 1){
                    res.status(400).send({
                        status:0,
                        message : "email already exist"
                    })
                }
                else{
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if(err){
                            res.status(400).send({
                                status: 0, 
                                message: err
                            });
                        }
                        else{
                            if (req.file) {
                                profilePicture = req.file.path
                            }
    
                            const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
                            const user = new User;
                            user.name = req.body.name;
                            user.email = req.body.email;
                            user.password = hash; 
                            user.profilePicture =  (req.file ? req.file.path : req.body.profilePicture);
                            user.code = verificationCode; 
                            user.save()
    
                            .then(result => {
                                sendEmail(user.email, verificationCode, "Email verification");
    
                                return res.status(400).send({
                                    status: 1, 
                                    message: 'User verification code successfully sent to email.',
                                    data: {
                                        user_id: result._id
                                    }
                                });
                            })
                            .catch(errr => {
                                res.status(400).send({
                                    status: 0, 
                                    message: errr 
                                });
                            });
                        }
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    status: 0, 
                    message: err 
                });
            });
        }   
    }   

//login User

const login = async (req , res )=>{
    if(!req.body.email){
        return res.status(400).send({
            status : 0,
            message: "email field is required"
        })
    }
    else if(!req.body.password){
        return res.status(400).send({
            status : 0,
            message : "Password field is required"
        })

    }
    else {
        User.find({email : req.body.email}).select("+password")
        .exec()
        .then(user =>{
            if(user.length<1){
                return res.status(400).send({
                    status: 0,
                    message : "email not found"
                })                                                 
            }
            else{
               // console.log(req.body);
                bcrypt.compare(req.body.password, user[0].password, (err , result) => {
                    // console.log("auth erre", err);
                    if(err){
                        return res.status(400).send({
                            status : 0,
                            message: "Authentication failed"
                        })
                    }
                    // console.log(err);
                    if(result){
                        const token = jwt.sign(
                        {
                            email : user[0].email,
                            userId : user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "24hr"
                        })

                        return res.status(200).send({
                            status : 1,
                            message: "user logged in",
                            token: token,
                            data : user[0]

                        })


                    }
                    return res.status(400).send({
                        status: 0, 
                        message: 'Incorrect password.'
                    })
                 
                });
                
            }
        
        })
        .catch(err => {
            res.status(400).send({
                status : 0,
                message : err
            })
        })
    }
}


//follow and unfollow 

const followUser = async(req,res)=>{
    try{
        const userToFollow = await User.findById(req.params.id)
        const loggedInUser = await User.findById(req.user._id)

        if(!userToFollow){
            return res.status(404).send({
                status:0,
                message : "User not found"
            })


        }
        if(loggedInUser.following.includes(userToFollow._id)){
            const indexfollowing = loggedInUser.following.indexOf(userToFollow._id)
            const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id)
            
            
            loggedInUser.following.splice(indexfollowing, 1)
            userToFollow.followers.splice(indexfollowers, 1)


            await loggedInUser.save()
            await userToFollow.save()

            return res.status(200).send({
                status : 1,
                message: "User unfollowed"
            })
        }else{


        loggedInUser.following.push(userToFollow._id)
        userToFollow.followers.push(loggedInUser._id)

        await loggedInUser.save()
        await userToFollow.save()

        return res.status(200).send({
            status : 1,
            message: "User Followed"
        })
    }

    }
    catch(error){         
        return res.status(400).send({
            status : 0,
            message : "follow User not Working"
        })
    }

}

const updateProfile = async(req, res) =>{
    try{
        const user = await User.findById ( req.user._id ) ;
        const { name , email } = req.body ;
        if ( name ) {
        user.name = name ;
        }
        if ( email ) {
        user.email = email ;
        }
        // User Avatar : TODO
        await user.save ( ) ;

        return res.status(200).send({
            status : 1,
            message: "profile updated"
        })
    }
    catch (error) {
    return res.status(500).json({
    status : 0 ,
    message : error.message ,
    } ) ;
    }
}

const deleteProfile = async(req, res)=>{
    try {
        console.log("delete" , req.user);
        const user = await User.findById(req.user._id) 
        const posts = user.posts
        const followers = user.followers
        const following = user.following
        const userId = user._id
        
        await user.remove ( ) ;
        // // Logout user after deleting profile
        // res.cookie ( " token " , null , {
        // expires : new Date ( Date.now ( ) ) ,
        // httpOnly : true ,
        // } ) ;
        // Delete all posts of the user
        for (let i=0; i < posts.length ; i++ ) {
        const post = await Post.findById(posts[i])
        await post.remove()
        }

        // removing user from followers following

       

        // for (let i = 0; i < followers.length; i++) {
        //     const follower = await User.findById(followers[i])

        //     const index = follower.following.indexOf(userId)
        //     follower.following.splice(index, 1)

        //     await follower.save()
        // }
        // // removing user from following's  follower

        // for (let i = 0; i < following.length; i++) {
        //     const follows = await User.findById(following[i])

        //     const index = follows.following.indexOf(userId)
        //     follows.following.splice(index, 1)

        //     await follows.save()
        // }
         //Remove all user from followers following
         for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId)
            follower.following.splice(index, 1)
            await follower.save()
        }
        //Remove all user from following's follower
        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);
            const index = follows.followers.indexOf(userId)
            follows.followers.splice(index, 1)
            await follows.save()
        }

        return res.status(200).send({
            status: 1,
            message: "profile deleted"
        })
    }catch(error){
        return res.status(400).send({
            status : 0,
            message : "Delete my profile not working"
        })

    }
}


const myProfile = async(req ,res) =>{
    try {
        const user = await User.findById(req.user._id).populate("posts") ;
        res.status(200).json({
        success:true ,
        user ,
        });
    }catch(error){
        res.status(500).json({
        success : false ,
        message : error.message ,
        }) 
        } 
        
}


//get user

const getUser = async(req,res) =>{
    try {
        const user = await User.findById(req.params.id).populate( "posts") ;
        if(!user){
        return res.status( 404 ).json({
        success : false ,
        message : " User not found " ,
        })
        }
        res.status(200).json({
        success : true ,
        user ,
        })
        }catch(error) {
        res.status(500).json({
        success : false ,
        message : error.message ,
        })
    } 
}

//get all users

const getAllUsers = async (req,res) =>{
    try {
        const users = await User.find({ }) ;
        res.status(200).json({
        success : true ,
        users ,
        })
    }catch(error) {
        res.status(500).json({
        success : false ,
        message : error.message ,
        } ) ;
    }
}


// forget password

// const forgetPassword = async(req, res) =>{
//     const user = await User.findOne({email : req.body.email})

//     if(!user){
//         return res.status(400).json({
//             status : 0,
//             message : "User not found"
//         })
//     }
    
//     const resetPasswordToken =user.getResetPasswordToken()
// }

/** Forgot password */
const forgotPassword = async (req, res) => {
    if(!req.body.email){
        res.status(400).send({
            status: 0, 
            message: 'Email filed is required' 
        });
    }
    else{
        User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if(user.length < 1){
                return res.status(404).send({
                    status: 0, 
                    message: 'Email not found!' 
                });
            }
            else{
                const verificationCode = Math.floor(100000 + Math.random() * 900000);

                User.findByIdAndUpdate(user[0]._id, { code: verificationCode }, (err, _result) => {
                    if(err){
                        res.status(400).send({
                            status: 0, 
                            message: 'Something went wrong.' 
                        });
                    }
                    if(_result){
                        sendEmail(user[0].email, verificationCode, 'Forgot Password');
                        res.status(200).send({
                            status: 1, 
                            message: 'Code successfully send to email.',
                            data: {
                                user_id: user[0]._id
                            }
                        });
                    }
                });
            }
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found' 
            });
        });
    }
}

/** Verify user */
const verifyUser = async (req, res) => {
    if(!req.body.user_id){
        res.status(400).send({
            status: 0, 
            message: 'User id filed is required' 
        });
    }
    else if(!req.body.verification_code){
        res.status(400).send({
            status: 0, 
            message: 'Verification code filed is required' 
        });
    }
    else{
        User.find({ _id: req.body.user_id })
        .exec()
        .then(result => {
            if(!req.body.verification_code){
                res.status(400).send({
                    status: 0, 
                    message: 'Verification code is required.' 
                });
            }

            if(req.body.verification_code == result[0].code){

                User.findByIdAndUpdate(req.body.user_id, { verified: 1, code: null }, (err, _result) => {
                    if(err){
                        res.status(400).send({
                            status: 0, 
                            message: 'Something went wrong.' 
                        });
                    }
                    if(_result){
                        res.status(200).send({
                            status: 1, 
                            message: 'Otp matched successfully.' 
                        });
                    }
                });
            }
            else{
                res.status(200).send({
                    status: 0, 
                    message: 'Verification code did not matched.' 
                });
            }
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found' 
            });
        });
    }
}

/** Resend code */
const resendCode = async (req, res) => {
    if(!req.body.user_id){
        res.status(400).send({
            status: 0, 
            message: 'User id failed is required.' 
        });
    }
    else{
        User.find({ _id: req.body.user_id })
        .exec()
        .then(result => {
            const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
            User.findByIdAndUpdate(req.body.user_id, { verified: 0, code: verificationCode }, (err, _result) => {
                if(err){
                    res.status(400).send({
                        status: 0, 
                        message: 'Something went wrong.' 
                    });
                }
                if(_result){
                    sendEmail(result[0].email, verificationCode, "Verification Code Resend");
                    res.status(200).send({
                        status: 1, 
                        message: 'Verification code resend successfully.' 
                    });
                }
            });
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found' 
            });
        });
    }
}

const updatePassword = async (req, res) => {
    if(!req.body.user_id){
        res.status(400).send({
            status: 0, 
            message: 'User id filed is required.' 
        });
    }
    else if(!req.body.new_password){
        res.status(400).send({
            status: 0, 
            message: 'New password filed is required.' 
        });
    }
    else{
        User.find({ _id: req.body.user_id })
        .exec()
        .then(user => {

            bcrypt.hash(req.body.new_password, 10, (error, hash) => {
                if(error){
                    return res.status(400).send({
                        status: 0, 
                        message: error
                    });
                }
                else{
                    User.findByIdAndUpdate(req.body.user_id, { password: hash }, (err, _result) => {
                        if(err){
                            res.status(400).send({
                                status: 0, 
                                message: 'Something went wrong.' 
                            });
                        }
                        if(_result){
                            res.status(200).send({
                                status: 1, 
                                message: 'Password updated successfully.' 
                            });
                        }
                    });
                }
            });
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found.'
            });
        });
    }
}



module.exports = {register, login , updatePassword , followUser, updateProfile , deleteProfile , myProfile , getUser, getAllUsers , forgotPassword , verifyUser , resendCode}
