var express = require('express');
var firebase = require('firebase');
var app = express();

var config = {
    apiKey: "AIzaSyD3g3DBx29xePdb4t12mF0avxQcm1QCMGU",
    authDomain: "zachs-portfolio.firebaseapp.com",
    databaseURL: "https://zachs-portfolio.firebaseio.com",
    projectId: "zachs-portfolio",
    storageBucket: "zachs-portfolio.appspot.com",
    messagingSenderId: "12771110601"
};

firebase.initializeApp(config);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});