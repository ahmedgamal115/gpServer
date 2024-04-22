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
    employeesID: async(orders)=>{
        if(orders.employeesID){
            return new Promise((resolve,reject)=>{
                pool.query(`SELECT * FROM employess WHERE employess.employeesID = ${orders.employeesID}`,(err,results)=>{
                    if(err) {
                        reject(err)
                    }else{
                        resolve(results)
                    }
                })
            })
        }
    }
}