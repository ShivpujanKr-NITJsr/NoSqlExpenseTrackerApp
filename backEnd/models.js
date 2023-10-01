const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const userSchema=new Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    ispremiumuser:{
        type:Boolean
    },
    totalexpense:{
        type:Number,
        default:0
    },
    // expenses:[{expenseId:{type:Schema.Types.ObjectId,ref:'Expense'}}]
})

const expenseSchema=new Schema({
    UserId:{
        type:String
    },
    price:{
        type:Number
    },
    description:{
        type:String
    },
    category:{
        type:String
    }
})

const premiumSchema=new Schema({
    UserId:{
        type:String
    },
    price:{
        type:Number
    },
    paymentid:{
        type:String
    },
    orderid:{
        type:String
    },
    status:{
        type:String
    }
})

const forgotPasswordSchema=new Schema({
    UserId:{
        type:String
    },
    isActive:{
        type:Boolean
    },
    uuid:{
        type:String
    }
})

const filedownloadedSchema=new Schema({
    UserId:{
        type:String
    },
    url:{
        type:String
    },
    date:{
        type:Date
    }
})

const Expense=mongoose.model('Expense',expenseSchema)
const User=mongoose.model('User',userSchema)
const Premium=mongoose.model('Premium',premiumSchema)
const ForgotPassword=mongoose.model('Forgotpassword',forgotPasswordSchema)
const Filedownloaded=mongoose.model('Filedownloaded',filedownloadedSchema)



module.exports={Expense,User,Premium,ForgotPassword,Filedownloaded};

// const sequelize=require('./databasecon')

// const Sequelize=require('sequelize');

// const User = sequelize.define('User',{

//     id:{
//         type:Sequelize.INTEGER,
//         autoIncrement:true,
//         primaryKey:true,
//         allowNull:false
//     },
//     name:{
//         type:Sequelize.STRING,

//     },
//     email:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     password:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     ispremiumuser:Sequelize.STRING,
//     totalexpense:Sequelize.INTEGER
// })

// const Expense = sequelize.define('expense', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//         allowNull: false
//     },
//     price: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     category: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// },{
//     timestamps:false
// }
// )

// const Premium= sequelize.define('premium',{
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//         allowNull: false
//     },
//     // price: {
//     //     type: Sequelize.INTEGER,
//     //     allowNull: false
//     // },

//     paymentid:Sequelize.STRING,
//     orderid:Sequelize.STRING,
//     status:Sequelize.STRING,

// })

// const ForgotPassword=sequelize.define('forgotpassword',{
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
        
//         allowNull: false
//     },
//     isActive:Sequelize.BOOLEAN,
//     uuid:Sequelize.STRING
// })

// const Filedownloaded=sequelize.define('filedownloaded',{
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
        
//         allowNull: false
//     },
//     url:Sequelize.STRING,
//     date:Sequelize.DATE
// })

// // Premium.sync({force:true})
