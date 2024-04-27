const mysql = require('mysql');
require('dotenv').config()

const createEmployesTable = async(databaseName)=>{
  const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: databaseName
  });
  try {
    await con.connect((err) => {
        if (err) throw err;
        let sql = `CREATE TABLE IF NOT EXISTS Employess ( employeesID INT AUTO_INCREMENT PRIMARY KEY , 
                    name VARCHAR(255) NOT NULL, username VARCHAR(255) UNIQUE, password VARCHAR(255) UNIQUE, address VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL UNIQUE, 
                    age INT NOT NULL, role INT NOT NULL)`
        con.query(sql,(err,results)=>{
            if(err) throw err
        })    
    });
  } catch (error) {
      console.log(error)
  }
}

const createOrdersTable = (databaseName,databaseHost,databasePassword,databaseUser)=>{
  const con = mysql.createConnection({
    host: databaseHost,
    user: databaseUser,
    password: databasePassword,
    database: databaseName
  });
  try {
    con.connect((err) => {
        if (err) throw err;
        let sql = `CREATE TABLE IF NOT EXISTS Orders ( ordersID INT AUTO_INCREMENT PRIMARY KEY ,carNumber INT NOT NULL, 
                carText VARCHAR(255) NOT NULL, ownerName VARCHAR(255) NOT NULL, licenseImage VARCHAR(255) NOT NULL, 
                carType VARCHAR(255) NOT NULL, STATUS INT, arriveTime DATETIME NOT NULL, leaveTime DATETIME NOT NULL, 
                expired INT NOT NULL, conter INT NOT NULL, employeesID int, email VARCHAR(255) NOT NULL,
                reason VARCHAR(255) NOT NULL, FOREIGN KEY (employeesID) REFERENCES Employess(employeesID)
                ,CONSTRAINT carLicence UNIQUE (carText,carNumber))`
        con.query(sql,(err,results)=>{
            if(err) throw err
        })    
    });
  } catch (error) {
      console.log(error)
  }
}

const CreateDatabase = async()=>{
  const databaseName = process.env.DATABASE_NAME
  const databaseHost = process.env.DATABASE_HOST
  const databaseUser = process.env.DATABASE_USER
  const databasePassword = process.env.DATABASE_PASSWORD
  const connection = mysql.createConnection({
          host: databaseHost,
          user: databaseUser,
          password: databasePassword,
          database: 'mysql'
          
  });
  await connection.query(`SHOW DATABASES LIKE "${databaseName}"`, (err, results) => {
    if (err) {
      console.error('Error checking database existence:', err);
      return;
    }
  
    if (results.length === 0) {
      // If the database doesn't exist, create it
      connection.query(`CREATE DATABASE ${databaseName}`, (err) => {
        if (err) {
          console.error('Error creating database:', err);
          return;
        }
        console.log('Database created successfully');
        createEmployesTable(databaseName,databaseHost,databasePassword,databaseUser).then(()=>{
          createOrdersTable(databaseName,databaseHost,databasePassword,databaseUser)
        })
      });
    } else {
      // If the database exists, simply connect to it
      console.log("Database existed")
      createEmployesTable(databaseName,databaseHost,databasePassword,databaseUser).then(()=>{
        createOrdersTable(databaseName,databaseHost,databasePassword,databaseUser)
      })
    }
  })
}


module.exports = CreateDatabase
