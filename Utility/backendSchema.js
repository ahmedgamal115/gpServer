const { gql } = require("apollo-server-express");


module.exports = gql`
    scalar DateTime
    scalar Upload

    type Query{
        feedEmployess: [Employess]!

        feedOrders: [Orders]!
        ordersByState: [Orders]!

        me( employeesID: ID! ): Employess!
    }
    type Employess {
        employeesID: ID!
        name: String!
        username: String!
        password: String!
        address: String!
        phone: String!
        age: Float!
        role: Float!
    }
    type Orders {
        ordersID: ID!
        carNumber: Float!
        carText: String!
        ownerName: String!
        licenseImage: String!
        email: String!
        carType: String!
        STATUS: Int
        arriveTime: DateTime!
        leaveTime: DateTime!
        expired: Int!
        conter: Float
        reason: String!
        employeesID: [Employess]
    }
    type Mutation{
        signUp(name: String!, username: String!, password: String!,
            address: String!, phone: String!,
            age: Float!, role: Float! ): String!
        
        signIn(username: String!, password: String!): String!

        addOrder( carNumber: Float!,
            carText: String!,
            ownerName: String!,
            licenseImage: Upload!,
            carType: String!,
            arriveTime: String!,
            email:String!,
            leaveTime: String!,
            reason: String!): Orders!

        changeOrderStatus( ordersID: ID!, STATUS: Int! ) : Orders!
        entiryCar( carNumber: Float!,
            carText: String! ) : Boolean!
    }
`