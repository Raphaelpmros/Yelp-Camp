const express = require('express');
const router = express.Router();
const con = require('../database/db');
const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const salts = 10


router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, salts);
        const sql = `INSERT INTO user (email, username, password) VALUES ('${email}', '${username}', '${passwordHash}')`;
        const result = await new Promise((resolve, reject) => {
            con.query(sql, function (err, result) {
                if (err) reject(err);
                resolve(result);
            });
        });
        req.flash('sucess', 'Register complete')
        res.redirect('/login');
    } catch (error) {
        const errorMessage = error.message;
        req.flash('error', errorMessage);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login')
});

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


  passport.use(new LocalStrategy(async function(username, password, done) {
    try {
        const rows = await new Promise((resolve, reject) => {
            con.query('SELECT * FROM user WHERE username=?', [username], function(err, rows) {
                if (err) reject(err);
                resolve(rows);
            });
        });

        if (rows.length === 0) {
            return done(null, false, { message: 'Usuário não encontrado.' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            return done(null, user.id);
        } else {
            return done(null, false, { message: 'Senha incorreta.' });
        }
    } catch (error) {
        return done(error);
    }
}));

router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('sucess', 'Wellcome to yelpCamp')
    res.redirect('/campgrounds');
});

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error(err);
        }
        req.flash('sucess', 'Goodbye!!!');
        res.redirect('/campgrounds');
    });
});


module.exports = router
