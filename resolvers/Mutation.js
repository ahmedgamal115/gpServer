var mysql = require('mysql');
require('dotenv').config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const bucket = require("../Utility/fireBaseConfig")


const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

const addnewImage = async(image)=>{
    const { createReadStream, filename, encoding, mimetype } = await image
    const stream = createReadStream();
    const fileUpload = bucket.file(`License/${filename}`);
    const uploadStream = fileUpload.createWriteStream({
        metadata: {
            contentType: mimetype
        }
    });
    await stream.pipe(uploadStream)
    let imageUrl = (await fileUpload.getSignedUrl({
        action: 'read',
        expires: '01-01-2025', // Adjust the expiration time as needed
    }))
    return imageUrl[0]
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
                                    resolve(order)
                                }
                            }
                        })
                    }
                }
            })
        }) 
    }
}