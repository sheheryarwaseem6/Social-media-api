const router = require('express').Router()
const {createPost , likeAndUnlike ,updatePost , deletePost, getPostOfFollowing, addComments, deleteComment} = require('../controllers/postController')
const {register , login , socialLogin , followUser , updateProfile, deleteProfile , myProfile, getUser, getAllUsers, forgotPassword , verifyUser , resendCode, updatePassword} = require('../controllers/userController')
const { verifyToken } = require('../middleware/authenticate')
const { upload } = require('../middleware/multer')


router.post('/createPost',verifyToken, createPost)
router.delete('/deletePost/:_id',verifyToken,  deletePost)
router.put('/update/:id', verifyToken , updatePost)
router.get('/post/:id',verifyToken, likeAndUnlike)
router.delete('/delete/me' , verifyToken , deleteProfile)
router.get('/me' , verifyToken , myProfile)
router.get('/user/:id',verifyToken, getUser)
router.get('/users',verifyToken, getAllUsers)

router.get('/follow/:id', verifyToken, followUser)
router.get('/posts', verifyToken, getPostOfFollowing)
router.put('/comment/:id' , verifyToken , addComments)
router.delete('/comment/:id', verifyToken , deleteComment)

router.put('/update/profile', verifyToken, updateProfile)



router.post('/register', upload.single('profilePicture'), register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword);
router.post('/verify-user', verifyUser);
router.post('/resend-code', resendCode);
router.post('/update-password', updatePassword);
router.post('/social-login', socialLogin)






module.exports = router