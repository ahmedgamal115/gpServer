const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const cors = require('cors')
const typeDefs = require('./Utility/backendSchema')
const resolvers = require('./resolvers')
const dbConnect = require('./Utility/dbConnection')
const jwt = require('jsonwebtoken')
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');
const cron = require('node-cron')
var mysql = require('mysql')
require('dotenv').config()
// const models = require('./Models')
const path = require('path')


const app = express()
const port = process.env.port || 4000

app.use(graphqlUploadExpress());
app.use(cors())
app.use("/Licence", express.static("Licence"));

const getUser = (tokken)=>{
    if(tokken){
        try {
            return jwt.verify(tokken,process.env.TOKEN_SECRET)
        } catch (error) {
            console.log(error)
        }
    }
}

const updateExpired = ()=>{
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });
    new Promise((resolve,reject)=>{
        let currentDate = new Date().toISOString()
        pool.query(`UPDATE orders SET expired = 1 WHERE leaveTime <= '${currentDate}'`,(err,results)=>{
            if(err){
                reject(err)
            }else{
                if(results.changedRows !== 0){
                    resolve("Data Expired Updated")
                }
            }
        })
    })
}

const serverGraphql = async()=>{
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({req})=>{
            const tokken = req.headers.authorization
            const user = getUser(tokken)
            return user
            // return models
        }
    })
    await server.start()
    server.applyMiddleware({ app , path:'/api' })
}

cron.schedule('* * * * *', async () => {
    try {
      await updateExpired();
    } catch (error) {
      console.error('Error updating expired orders:', error);
    }
});

serverGraphql()
dbConnect()

app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})