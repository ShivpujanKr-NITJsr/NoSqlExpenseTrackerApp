const express=require('express')
const cors=require('cors')
const app=express();
require('dotenv').config();
const {Expense,User,Premium,ForgotPassword,Filedownloaded}=require('./models')
const router =require('./routes');
const sequelize = require('./databasecon');

const mongoose =require('mongoose')

const helmet=require('helmet')
const Sib=require('sib-api-v3-sdk')
const morgan=require('morgan')
const path=require('path')

const fs=require('fs')

const accessLogStream= fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})

app.use(morgan('combined',{stream:accessLogStream}))

// app.use(helmet())



app.use(express.json())
app.use(cors())

// app.use((req, res, next) => {
//     res.setHeader(
//         'Content-Security-Policy',
//         "script-src 'self' cdnjs.cloudflare.com 'nonce-your-random-nonce'"
//     );
//     next();
// });

app.use('/',router)           ///////////////////////////////////

// User.hasMany(Expense);
// User.hasMany(Premium)
// Expense.belongsTo(User);
// Premium.belongsTo(User)

// User.hasMany(ForgotPassword);
// ForgotPassword.belongsTo(User)

// User.hasMany(Filedownloaded)
// Filedownloaded.belongsTo(User)

// sequelize.sync({alter:true})

mongoose.connect(process.env.mongolink).then(result=>{

    app.listen(3000,()=>console.log('hey i am server'))
}).catch(err=>console.log(err))