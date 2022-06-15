const Post = require('../models/Post')
const User = require('../models/User')


//create a new post
const createPost = async(req, res)=>{
    try{
        const newpost = {
            caption: req.body.caption,
            image:{
                public_id: "req.body.public_id",
                url: "req.body.url"
            },
            owner: req.user._id

        }
        const post = await Post.create(newpost)                      
        const user = await User.findById(req.user._id)
        user.posts.push(post._id)
        await user.save()

        res.status(200).send({
            status : 1,
            post
        })

    }
    catch(error){
        res.status(400).send({
            status : 0,
            message : error
        })
    }
}

//likes and unlike 

const likeAndUnlike = async (req,res) =>{
    try{
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(400).send({
                status : 0,
                message: "post not found"
            })
        }
        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id)
            post.likes.splice(index, 1)
            await post.save()

            return res.status(200).send({
                status : 1,
                message: "post unliked"
            })

        }
        else{
            post.likes.push(req.user._id)
            await post.save()
            return res.status(200).send({
                status : 1,
                message: "post liked"
            })


        }

    }
    catch(err){
        res.status(400).send({
            status : 0,
            message : "like unlike not working"
        })
    }
}

//update post

const updatePost = async(req ,res)=>{
    try{
        const post = await Post.findById(req.params.id) ;
        if (!post) {
            return res.status(40 ).json({
            success : false ,
            message : " Post not found " ,
            })
        }
        if( post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
            success : false ,
            message : " Unauthorized " ,
            })     
        }
        post.caption = req.body.caption
        await post.save()
        return res.status(200).send({
            status : 1 ,
            message : " Caption Updated " ,
            })     
    }catch ( error ) {
        res.status(500).json({
        success : false ,
        message : error.message ,
        } ) ;
    }
}

//delete post

const deletePost = async(req,res)=>{
    try{
        const post = await Post.findByIdAndDelete(req.params._id)
        if(!post){
            return res.status(404).send({
                status : 0,
                message: "post not found"
            })
        }
        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).send({
                status : 0,
                message: "user unauthorized"
            })
            
        }
            await post.remove()
            const user = await User.findById(req.user._id)
            const index = user.posts.indexOf(req.params._id)
            user.posts.splice(index , 1)

            await user.save()


            return res.status(200).send({
                status : 1,
                message:"post deleted"
            })
        


        
    }
    catch(error){
        res.status(400).send({
            status : 0,
            message : "Delete is not working"
        })
    }
}

const getPostOfFollowing = async (req, res ) =>{
    try{
        const user = await User.findById(req.user._id)
        const posts = await Post.find({
            owner : {
            $in : user.following ,
            } ,
        } )

        res.status( 200 ).json ( {
        success : true ,
        posts 
        } ) 

    }
    catch(error){
        return res.status(400).send({
            status : 0,
            message : "get Post Of Following not Working"
        })
    }
}


//add comments

const addComments = async (req , res) => {
    try {
        const post = await Post.findById(req.params.id) 
        if(!post) {
        return res.status(404).json({
        success : false ,
        message : " Post not found " 
        } ) ;
        }
        let commentIndex = -1 ;
        // Checking if comment already exists

        post.comments.forEach((item , index) => {
            if (item.user.toString ( ) === req.user._id.toString ( ) ) {
            commentIndex = index ;
            }
        })
        if ( commentIndex !== -1 ) {
            post.comments[commentIndex].comment =req.body.comment
            await post.save() ;
            
            return res.status(200).json({
            success : true ,
            message : " Comment Updated " ,
            }) 

            } else{
            post.comments.push({
            user : req.user._id ,
            comment : req.body.comment ,
            }) 
            }
            await post.save()
            return res.status(200).json({
                success : true ,
                message : " Comment added " ,
                }) 

        }catch(error){
            res.status(500).json({
                success : false ,
                message : error.message ,
                }) 

        }
}

const deleteComment = async (req,res) =>{
    try{
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(400).json({
                success : false ,
                message : "post not found" ,
                }) 

        }
        if(post.owner.toString() === req.user._id.toString()){
            if(req.body.commentId == undefined){
                return res.status(400).json({
                    success : false ,
                    message : "comment ID is required" ,
                    })
            } 


            post.comments.forEach((item , index ) =>{
                if(item._id.toString() === req.body.commentId.toString()){
                return post.comments.splice(index , 1) ;
            }
        })

            await post.save()

            return res.status(200).json({
                success : true ,
                message : "comment deleted" 
                }) 
            

        }
        else{
            post.comments.forEach((item , index ) => {
                if(item.user.toString() === req.user._id.toString()){
                return post.comments.splice(index , 1) ;
                }
                })
                await post.save ( ) ;
                res.status ( 200 ) .json ( {
            
                success : true ,
                message : " Your Comment has deleted " ,
                } ) ;
        }

    }catch(error){
        res.status(500).json({
            success : false ,
            message : error.message ,
            }) 
    }
}


module.exports ={createPost, likeAndUnlike, updatePost, deletePost , getPostOfFollowing , addComments , deleteComment}