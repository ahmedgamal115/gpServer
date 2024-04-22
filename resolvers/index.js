const Query = require('./Query')
const Mutation = require('./Mutation')
const Orders = require('./orders')
const {GraphQLDateTime} = require('graphql-iso-date')
const GraphQLUpload = require("graphql-upload/GraphQLUpload.js");

module.exports = {
    Query,
    Mutation,
    Orders,
    DateTime: GraphQLDateTime,
    Upload: GraphQLUpload
}