const express = require("express");
const app = express();
const ExpressError = require("./utils/expressError");
const path = require("path");
const con = require("./database/db");
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const campgrounds = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const users = require("./routes/users");

app.engine("ejs", ejsMate);
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.loggin = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use('/', users)

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("listenning on port 3000");
});
