const jwt = require ('jsonwebtoken')
const User = require('../models/User')

const verifyToken = async(req , res, next) =>{
    if(!req.headers['authorization']){
        return res.status(400).send({
            status : 0,
            message : "unauthorized"
        })
    }

    // const authHeader = req.headers["authorization"]
    // const bearerToken = authHeader.split(' ')
    // const token = bearerToken[1]

    // jwt.verify(token, process.env.KWT_KEY, (err , payload , next) =>{
    //     if(err){
    //         const message = 
    //         err.name === 'jsonWebTokenError' ? 'Unauthorized' : err.message
    //         return res.status(400).send(
    //         {
    //             status : 0 ,
    //             message : message
    //         })
    //     }
    //     req.payload = payload
    //     next()
    // })

    try {
        // Get token from header
        token = req.headers['authorization'].split(' ')[1]
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        console.log('token ** ', decoded);
        //Get user from the token
        req.userId= decoded.userId
        req.user = await User.findById(decoded.userId).select('-password')
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).send({ status: 0, message: ' catch Unauthorized' });
    }
};



module.exports = {verifyToken}