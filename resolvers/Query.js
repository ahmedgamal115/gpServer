const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
var mysql = require('mysql');
require('dotenv').config()

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

module.exports = {
    feedEmployess: async() => {
        return new Promise((resolve, reject) => {
          pool.query('SELECT * FROM employess', (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
    },
    feedOrders: async(parent,args,user)=>{
      if(!user.employeesID){
        throw new ForbiddenError(" Not authenticated for you ")
      }else{
        return new Promise((resolve,reject)=>{
          pool.query(`SELECT role FROM employess WHERE employeesID = ${user.employeesID}`,(err,results)=>{
            if(err){
              reject(err)
            }else{
              if(results[0].role === 0){
                pool.query(`SELECT * FROM orders`,(err,results)=>{
                    if(err){
                        throw err
                    }else{
                        resolve(results)
                    }
                })
              }else{
                resolve(new AuthenticationError(" Not authenticated for you "))
              }
            }
          })
        })
      }
    },
    ordersByState: async()=>{
      return new Promise((resolve,reject)=>{
        pool.query(`SELECT * FROM orders WHERE orders.STATUS IS NULL AND expired = 0`,(error,results)=>{
            if(error){
                reject(error)
            }else{
                resolve(results)
            }
        })
    })
    },
    me:async(parent,args,user)=>{
        return new Promise((resolve,reject)=>{
          pool.query(`SELECT * FROM employess WHERE employeesID = ${user.employeesID}`,(err,results)=>{
            if(err){
              reject(err)
            }else{
              if(results.length !== 0){
                resolve(results[0])
              }
            }
          })
        })
    }
}