var mysql = require('mysql');
require('dotenv').config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const bucket = require("../Utility/fireBaseConfig")
const nodemailer = require('nodemailer');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { initializeApp } = require('firebase/app');
const path = require('path');
const {acceptForm,refuseForm} = require('../Utility/templete')



const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
});

const firebaseConfig = {
    apiKey: "AIzaSyDtyMKju6XleXRrAVBdosR_dNL98XMniFo",
    authDomain: "testapp-10425.firebaseapp.com",
    projectId: "testapp-10425",
    storageBucket: "testapp-10425.appspot.com",
    messagingSenderId: "512324825092",
    appId: "1:512324825092:web:67749b95f4300bce01c551"
};
initializeApp(firebaseConfig)


const addnewImage = async(image)=>{
    const { createReadStream, filename, encoding, mimetype } = await image
    const stream = createReadStream();
    let imagePath = "Licence/" + `${filename.split(".")[0]}_${new Date().getHours()}_${new Date().getMinutes()}${path.extname(filename)}`
    const out = require('fs').createWriteStream(imagePath);
    stream.pipe(out);
    return imagePath
}

const sendMailRequste = async(email,username,status)=>{
    await transporter.sendMail({
        from: '"auctionlive0@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Respond to the request to parking", // Subject line
        text: `Hello ${username}`, // plain text body
        html: `<b>${status === 0 ? refuseForm
        : acceptForm}</b>`, // html body
    },(err,info)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Email Sended"+ info.response)
        }     
    });

}

module.exports = {
    signUp: async(parent, args)=>{
        let newEmployee = {
            name: args.name,
            username: args.username,
            password: args.password,
            address: args.address,
            phone: args.phone,
            age: args.age,
            role: args.role
        }
        let passwordHash = await bcrypt.hash(newEmployee.password,10)
        return new Promise((resolve,reject)=>{
            pool.query(`
            INSERT INTO employess(
                employess.name,
                employess.username,
                employess.password,
                employess.address,
                employess.phone,
                employess.age,
                employess.role
            )
            VALUES(
                '${newEmployee.name}',
                '${newEmployee.username}', 
                '${passwordHash}', 
                '${newEmployee.address}', 
                '${newEmployee.phone}', 
                ${newEmployee.age}, 
                ${newEmployee.role})`,(err,results)=>{
                if(err){
                    reject(err)
                }else{
                    pool.query(`SELECT
                    *
                    FROM
                    employess
                    WHERE
                    employess.username = "${newEmployee.username}" 
                    && employess.phone = "${newEmployee.phone}"`,(err,results)=>{
                        if(err) throw err
                        let tokken = jwt.sign({employeesID: results[0].employeesID}, process.env.TOKEN_SECRET, { expiresIn: '1 days' })
                        resolve(tokken) 
                    })
                }
            })
        })
    },
    signIn: async(parent,args)=>{
        return new Promise((resolve,reject)=>{
            pool.query(`SELECT * FROM employess 
            WHERE username = '${args.username}'`,async(err,results)=>{
                if(err){
                    reject(err)
                }else{
                    if(results.length !== 0){
                        let checkData = await bcrypt.compare(args.password , results[0].password)
                        if(checkData){
                            let tokken = jwt.sign({employeesID: results[0].employeesID}, process.env.TOKEN_SECRET, { expiresIn: '1 days' })
                            resolve(tokken)
                        }else{
                            resolve(
                                new AuthenticationError('Invalid Email or Password')
                            )
                        }
                    }else{
                        resolve(
                            new AuthenticationError('Invalid Email or Password')
                        )
                    }
                }
            })
        })
    },
    addOrder: async(parent,args)=>{
        let order = {
            carNumber: args.carNumber,
            carText: args.carText,
            ownerName: args.ownerName,
            licenseImage: args.licenseImage,
            email: args.email,
            carType: args.carType,
            arriveTime: args.arriveTime,
            leaveTime: args.leaveTime,
            reason: args.reason,
        }
        return addnewImage(order.licenseImage).then((image)=>{
            return new Promise((resolve,reject)=>{
                pool.query(`INSERT INTO orders(
                    carNumber,
                    carText,
                    ownerName,
                    licenseImage,
                    email,
                    carType,
                    arriveTime,
                    leaveTime,
                    reason
                )
                VALUES(
                    '${order.carNumber}',
                    '${order.carText}',
                    '${order.ownerName}',
                    '${image}',
                    '${order.email}',
                    '${order.carType}',
                    '${order.arriveTime}',
                    '${order.leaveTime}',
                    '${order.reason}'
                )`,(err,results)=>{
                    if(err){
                        reject(err)
                    }else{
                        resolve(order)
                    }
                })
            })
        })
    },
    changeOrderStatus: async(parent,args,user)=>{
        if(!user.employeesID){
            throw new AuthenticationError(" Not authenticated for you ")
        }else{
            return new Promise((resolve,reject)=>{
                pool.query(`UPDATE orders SET STATUS = ${args.STATUS},employeesID = ${user.employeesID} WHERE ordersID = ${args.ordersID}`,(err,results)=>{
                    if(err){
                        reject(err)
                    }else{
                        if(results.length !== 0){
                            pool.query(`SELECT * FROM orders WHERE ordersID = ${args.ordersID}`,(err,results)=>{
                                if(err){
                                    throw err
                                }else{
                                    sendMailRequste(results[0].email, results[0].ownerName, results[0].STATUS)
                                    resolve(results[0])
                                }
                            })
                        }
                    }
                })
            })
        }
    },
    entiryCar: async(parent,args,user)=>{
        console.log(args)
        let currentDate = new Date().toISOString()
        return new Promise((resolve,reject)=>{
            pool.query(`SELECT
            *
            FROM
                orders
            WHERE
                carNumber = '${args.carNumber}' AND carText = '${args.carText}' 
                AND expired = 0 
                AND STATUS = 1
                AND arriveTime <= '${currentDate}'`,(err,results)=>{
                if(err){
                    reject(err)
                }else{
                    if(results.length !== 0){
                        let order = results[0]
                        let counter = results[0].conter + 1
                        let orderId = results[0].ordersID
                        order.conter = counter
                        pool.query(`UPDATE orders SET conter= ${counter} WHERE ordersID = ${orderId}`,(err,results)=>{
                            if(err){
                                throw err
                            }else{
                                if(results.changedRows !== 0){
                                    resolve(true)
                                }
                            }
                        })
                    }else{
                        resolve(false)
                    }
                }
            })
        }) 
    }
}