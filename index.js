const express = require('express')
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const apiRoutes = require('./Routes/api')
const bodyParser = require('body-parser')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

//Multer file upload
app.use('/uploads', express.static('uploads'));



const PORT =process.env.PORT 

app.use('/api', apiRoutes)

mongoose.connect(
    process.env.DB_CONNECT,{
        useUnifiedTopology :true,
        useNewUrlParser : true
    }, () => console.log('Database Connected')
)

app.listen(PORT, ()=> console.log(`server is running on ${PORT} port.`))