const express = require('express');
const router = express.Router();
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const { storeReturnTo } = require('../middleware');
const users = require("../controllers/users")


router.get('/register', users.renderFormUser)

router.post('/register', users.createUser);

router.get('/login', (req, res) => {
    res.render('users/login')
});

passport.serializeUser(function(user, done) {
    return done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    return done(null, user);
  });


  passport.use(new LocalStrategy(users.validateLogin));

router.get('/show', users.showAfterLogin);


router.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), users.returnTo);

router.get('/logout', users.logout);


module.exports = router
