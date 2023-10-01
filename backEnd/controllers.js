const { Expense, User, Premium ,ForgotPassword,Filedownloaded} = require('./models')
const {createTransport}=require('nodemailer')
// const sequelize=require('./databasecon')
require('dotenv').config();
const Sib=require('sib-api-v3-sdk')
const {v4:uuidv4}=require('uuid')
const jwt = require('jsonwebtoken')
// const User=require('./models')
const fs=require('fs');

const AWS=require('aws-sdk')

const path=require('path')
const Razorpay = require('razorpay')

const bcrypt = require('bcrypt');
// const Sequelize = require('sequelize');

exports.creating = (req, res, next) => {
    const uname = req.body.name;
    const uemail = req.body.email;
    const upassword = req.body.password;

    User.find({ email: uemail } )
        .then(re => {

            if (re.length > 0) {
                // throw new Error('User with this email already exists');
                res.status(403).json({ Error: 'Error:Request failed with status code 403' })
            } else {
                bcrypt.hash(upassword, 10, (err, hash) => {
                    User.create({
                        name: uname,
                        email: uemail,
                        password: hash,
                        ispremiumuser:false,
                        totalexpense:0
                    }).then(result => res.json({ message: 'Successfully created new user' }))


                })

            }


        })
        .catch(err => console.log(err))

}

exports.logging = (req, res, next) => {
    const uemail = req.body.email;
    const upassword = req.body.password;

    User.find({ email: uemail } )
        .then(re => {

            if (re.length > 0) {
                // throw new Error('User with this email already exists');
                // console.log(re)
                // res.status(403).json({Error:'Error:Request failed with status code 403'})

                bcrypt.compare(upassword, re[0].password, function (err, result) {
                    if (result == true) {
                        let token = jwt.sign(re[0].id, 'shhhhh');

                        res.json({ success: true, msg: 'User login successful', token: token ,ispremiumuser:re[0].ispremiumuser})
                    } else {
                        res.status(401).json({ success: false, msg: 'User not authorized' })
                    }
                });
                // if(re[0].password==upassword){
                //     res.json({msg:'User login sucessful'})
                // }else{
                //     res.status(401).json({msg:'User not authorized'})
                // }
            } else {
                res.status(404).json({ success: false, msg: 'User not found' })

            }


        })
        .catch(err => console.log(err))

}

exports.forgotPasswd= async (req,res,next)=>{
    try {
        const result = await User.findOne({
       
                email: req.params.email
            
        })
        console.log(result);
        const uuid = uuidv4();
        console.log(uuid);
        if (result!== null) {

            const obj = {
                UserId: result._id,
                isActive: true,
                uuid: uuid,
            }
            // console.log(obj);
            const forgotResult = await ForgotPassword.create(obj);
           
            const defaultClient = Sib.ApiClient.instance;
            const apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.KEY_ID;
            console.log(process.env.KEY_ID);
            const transporter = createTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                auth: {
                    user: "unknownhacker000001@gmail.com",
                    pass: process.env.pass_id,
                },
            });
            // // 
            const mailOptions = {
                from: 'unknownhacker000001@gmail.com',
                to: req.params.email,
                subject: `Your subject`,
                text: `Your reset link is -  http://localhost:3000/password/resetpassword/${uuid}       
        This is valid for 1 time only.`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).json({message:' something went wrong'})
                } else {
                    console.log('Email sent: ' + info.response);
                    res.json({ message: "A reset link send to your email id" ,success:true,msg:'ok'})
                }
            });
            
        }
        else {
            res.status(404).json({message:"Invalid email id",status:501});
        }
    } catch (error) {
        console.log(error);
    }
}

exports.resetPassword=(req,res,next)=>{

    const uuidd=req.params.uuidd;
    console.log(req)

    ForgotPassword.findOne({uuid:uuidd,isActive:true})
        .then(result=>{
          
            if(result){
               
                fs.readFile(path.join(__dirname,'../','frontEnd','setpaswd.html'), 'utf8', (err, html) => {
                    if (err) {
                      console.error(err);
                      res.status(500).send('An error occurred.');
                    } else {
                      // Replace <%= uuidd %> with the actual uuidd value
                      const updatedHtml = html.replace('<%= uuidd %>', uuidd);
                
                      // Send the HTML content with the form and JavaScript
                      res.setHeader('Content-Security-Policy', `script-src 'self' cdnjs.cloudflare.com 'unsafe-inline'`)
                      res.send(updatedHtml);
                    //   res.end(updatedHtml)
                    }
                });
                // res.type('application/javascript');
                // res.setHeader('Content-Type', 'text/html');
                // res.
                // sendFile(path.join(__dirname,'..','frontEnd','setpaswd.html'))
            }else{
                res.status(404).json({message:'link is not valid',success:false})
            }
        }).catch(err=>{
            console.log(err);
            // res.json()
        })
}

exports.changingPasswd=async (req,res,next)=>{
    const uuidd=req.body.uuidd;
    const paswd=req.body.password;
    // const t=await sequelize.transaction();
    try{
       

        const fp=await ForgotPassword.findOne({uuid:uuidd,isActive:true})

        if(!fp){
            return res.status(404).json('invalid link')
        }
        const user=await User.findOne({_id:fp.UserId});

        // if(!user){
        //     return res.status(404).json('user does not exist')
        // }
        await ForgotPassword.updateOne({_id:fp._id},{isActive:false})

        bcrypt.hash(paswd, 10, async (err, hash) => {
        User.updateOne({_id:fp.UserId},{password:hash}).then(async result => {
            // res.json({ message: 'Successfully created new user' })
           
            res.status(200).json({message:'your password is updated , now go to login page and login again',success:'ok'})
        
        })})

        // await user.update({password:})
        
        
    }catch(err){
       
        console.log(err)
        console.log('something went wrong')
        res.status(503).json('got error while updating')
    }

    
}

async function  nextt(userid,ofset,itemsPerPage){

    try{
        const res= await Expense.find({ UserId: userid }).skip(ofset).limit(itemsPerPage)
        
        if (res.length>0){
            // console.log(res)
            return true;
        }
        // console.log(false)
        // console.log(err)
        return false;
    }catch(err){
        console.log(err)
        return false;
    }
    
   
}

exports.getexpenses = (req, res, next) => {
    // const itemsPerPage=req.headers.pagenumber;
    console.log(req.headers.pagenumber)
    const itemsPerPage=Number(req.headers.pagenumber);
    const of=((req.query.page||1)-1)
    console.log('i am in server for expense list')
    Expense.find( { UserId: req.iduse }).skip(of*itemsPerPage).limit(itemsPerPage)
        .then(async result => {
            let pre;let nex;let prev;let nextv;
            if(of===0){
                pre=false;
            }else{
                pre=true;
                prev=of;
            }
            const ans= await nextt(req.iduse,(of+1)*itemsPerPage,itemsPerPage)
            if(ans===true){
                nex=true;nextv=Number(of)+Number(2);
            }else{
                nex=false;
            }
            // console.log(prev,nextv,nex)
            res.json({result,pre,nex,nextv,prev})
        }).catch(err => console.log(err))
}

exports.delexpenses = async (req, res, next) => {
  

    try{
        const result= await Expense.find( { _id: req.params.id})
        
        const users=await User.findOne({_id:result[0].UserId})
        await Expense.deleteOne({ _id: req.params.id});
        const p=users.totalexpense-result[0].price;
        await User.updateOne({_id:result[0].UserId},{totalexpense:p});
        
        res.json(result);
    }catch(err){
        console.log(err)
    }
       
        
}

exports.addexpense =async (req, res, next) => {
    const token = req.body.token;
    let id;
    jwt.verify(token, 'shhhhh', function (err, decoded) {
        // console.log(decoded.foo) // bar
        if (err) {
            res.status(500).json({ success: false })
        }
        id = decoded;
    });
    // const t = await sequelize.transaction();

    try {
        const expenseResult = await Expense.create({
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            UserId: id
        });
        const user = await User.findOne({_id:id});
        let p;
        if (user.totalexpense === null) {
            p = parseFloat(expenseResult.price);
        } else {
            p = parseFloat(user.totalexpense)+parseFloat(expenseResult.price);
        }
        await User.updateOne({_id:user._id},{totalexpense: p});


        res.json(expenseResult);
    } catch (err) {
        console.error(err);

       
        // res.status(500).json(err);
    }

}

exports.premiumBuy = async (req, res, next) => {
    try {
        const rzp = new Razorpay({ key_id: process.env.key_id, key_secret: process.env.key_secret });
        const amount = 3900;

      
        const createOrder = () => {
            return new Promise((resolve, reject) => {
                rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(order);
                    }
                });
            });
        };
        const order = await createOrder();

        // Create a Premium record and handle errors
        await Premium.create({ orderid: order.id, status: 'PENDING', UserId: req.iduse });

        res.status(201).json({ order, key_id: rzp.key_id});
        
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
};



exports.updatingPremiumStatus = async(req, res, next) => {
    const id=req.iduse;
    const uorderid=req.body.order_id;
    const upaymentid=req.body.payment_id;
    if(!req.body.suc){
        
        try{
            console.log('payment passed')
            const p1=Premium.find({orderid:uorderid})
                .then(async result=>{
                    await Premium.updateOne({_id:result[0]._id},{paymentid:upaymentid,status:'SUCCESSFUL'})})
            const p2=User.find({_id:req.iduse}).then(async re=>{await User.updateOne({_id:re[0]._id},{ispremiumuser:true})})
            
            Promise.all([p1,p2]).then(()=>{
                return res.status(202).json({success:true,message:"Transactions successful"})
            }).catch(err=>{
                throw new Error(err)
            })
        }catch(error){
            return res.status(403).json({success:false,
                message:"transaction cancelled due to error"})
        }

    }else{

        try{
            console.log('payment failing in controllers')
            const p1=Premium.findAll({where:{orderid:uorderid}}).then(result=>{result[0].update({paymentid:upaymentid,status:'FAIL'})})

            const p2=User.findAll({where:{id:req.iduse}}).then(re=>{re[0].update({ispremiumuser:false})})

            Promise.all([p1,p2]).then(()=>{
                return res.status(202).json({success:true,message:"Transactions unsuccessful"})
            }).catch(err=>{
                throw new Error(err)
            })
        }catch(error){
            return res.status(403).json({success:false,message:err.message})
        }
    }
    

}

exports.leaderboardShow= async(req,resp,next)=>{


    try{

        const userss=await User.find().sort({totalexpense:-1})
        // console.log(userss)
        resp.status(200).json(userss)
    }catch(err){
        console.log(err);
        resp.status(500).json(err)
    }
    

}

exports.downloading=async(req,res,next)=>{

    try {
        const uid=req.iduse;

        const exp= await Expense.findOne({UserId:uid})

        // console.log(exp)

        const stringified=JSON.stringify(exp)

        const filename=`Expenses${uid}/${new Date()}.txt`;

        const fileurl=await uploadTos3(stringified,filename)
      
        await   Filedownloaded.create({url:fileurl,UserId:uid ,date:Sequelize.literal('CURRENT_TIMESTAMP')})
        // console.log(fileurl)
        res.status(200).json({fileurl,success:true})
    }catch(err){
        console.log(err)
    }



}

async function  uploadTos3(data,filename){
    const BUCKET_NAME=process.env.bucket_name
    const IAM_USER_KEY=process.env.access_key
    const IAM_SECRET_KEY=process.env.secret_key

    let s3bucket= new AWS.S3({
        accessKeyId:process.env.access_key,
        secretAccessKey: process.env.secret_key,
        

    })
    var params={
        Bucket:process.env.bucket_name,
        Key:filename,
        Body:data,
        ACL:'public-read'
    }
    return new Promise((res,rej)=>s3bucket.upload(params, (err, s3response)=>{
        if(err){
            console.log('something went wrong',err)
            rej(err)
        }else{
            console.log('success',s3response)
            res(s3response.Location);
            
        }
    }))

}

exports.allUrl=(req,res,next)=>{

    try{
        const id=req.iduse;

        Filedownloaded.find({UserId:id})
        .then(file=>{
            // console.log(file)
            res.status(200).json(file)
        }).catch(err=>{
            throw new Error(err)
        })
        
    }catch(err){
        console.log(err)
    }
    
}



