const express = require('express');
const app = express();
const path = require('path');
const con = require("./database/db");
const { rejects } = require('assert');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const allCampgrounds = new Promise((resolve, reject) => {
    con.query("SELECT * FROM campground", function (err, result) {
        if(err){
            reject(err);
        } else {
            resolve(result);;
        }
    });
});

app.get('/', (req,res) => {
    res.render('home');
})

app.get('/campgrounds', async (req,res) => {
    const campgrounds = await allCampgrounds;
    res.render('campgrounds/index', {campgrounds})
})

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database");
})


app.listen(3000, () => {
    console.log('listenning on port 3000')
})
