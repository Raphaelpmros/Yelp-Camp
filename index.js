const express = require('express');
const app = express();
const path = require('path');
const con = require("./database/db");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req,res) => {
    res.render('home');
})

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database");
})


app.listen(3000, () => {
    console.log('listenning on port 3000')
})
