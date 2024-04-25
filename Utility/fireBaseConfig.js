var admin = require("firebase-admin");

var serviceAccount = require('../serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "gs://testapp-10425.appspot.com"
// })

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://testapp-10425.appspot.com",
    databaseURL: "https://testapp-10425.firebaseio.com"
});


var bucket = admin.storage().bucket();

module.exports = bucket