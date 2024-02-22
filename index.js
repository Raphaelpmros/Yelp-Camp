const express = require("express");
const app = express();
const ExpressError = require('./utils/expressError');
const path = require("path");
const ejsMate = require("ejs-mate");
const Joi = require('joi');
const con = require("./database/db");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const campgrounds = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate)

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

// const validateReview = ((req, res, next) => {
//   const { error } = reviewSchema.validate(req.body);
//   if(error){
//     const msg = error.details.map(el => el.message).join(',')
//     throw new ExpressError(msg, 400)
//   } else {
//     next()
//   }
// })

app.get("/", (req, res) => {
  res.render("home");
});

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database");
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
  console.log("listenning on port 3000");
});
