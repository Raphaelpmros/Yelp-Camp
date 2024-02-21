const express = require("express");
const app = express();
const ExpressError = require('./utils/expressError');
const path = require("path");
const ejsMate = require("ejs-mate");
const Joi = require('joi');
const con = require("./database/db");
const bodyParser = require("body-parser");
const catchAsync = require('./utils/catchAsync');
const methodOverride = require("method-override");
const reviews = require('./models/review');


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

const allCampgrounds = new Promise((resolve, reject) => {
  con.query("SELECT * FROM campground", function (err, result) {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await allCampgrounds;
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", catchAsync(async (req, res) => {
    const { title, price, description, location, image } = req.body;
    con.query(
      "INSERT INTO campground (title, price, description, location, image) VALUES (?, ?, ?, ?, ?)",
      [title, price, description, location, image],
        res.redirect(`/campgrounds/${campground.id}`),
    );
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  con.query(
    `SELECT * FROM campground WHERE id = '${id}'`,
    function (err, campgroundResult, fields) {
      if (campgroundResult && campgroundResult.length > 0) {
        const campground = campgroundResult[0]; 
        con.query(
          `SELECT * FROM reviews WHERE id_camp = '${id}'`,
          function (err, reviewsResult, fields) {
            if (reviewsResult) {
              const reviews = reviewsResult;
              console.log(campground);
              res.render("campgrounds/show", { campground, reviews }); 
            } else {
              res.status(404).send("Reviews not found for this campground.");
            }
          }
        );
      } else {
        res.status(404).send("Campground not found.");
      }
    }
  );
}));


app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    con.query(
      `SELECT * FROM campground WHERE id = '${id}'`,
      function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send("Erro ao buscar o produto no banco de dados.");
          return;
        }

        if (result.length === 0) {
          res.status(404).send("Produto não encontrado.");
          return;
        }

        const campground = result[0];
        res.render("campgrounds/edit", { campground });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno do servidor.");
  }
}));

app.post("/campgrounds/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, location } = req.body;

    con.query(
      `UPDATE campground SET title = ?, price = ?, description = ?, location = ? WHERE id = ?`,
      [title, price, description, location, id],
      function (err, result) {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send("Erro ao atualizar o produto no banco de dados.");
          return;
        }

        res.redirect("/campgrounds");
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno do servidor.");
  }
});

app.delete("/campgrounds/:id/", async (req, res) => {
  try {
    const { id } = req.params;
    con.query(`DELETE FROM reviews WHERE id_camp = ${id}`, function (err) {
      if (err) throw err;
    })

    con.query(`DELETE FROM campground WHERE id = ${id}`, function (err) {
      if (err) throw err;
      res.redirect("/campgrounds");
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/campgrounds/:id/reviews', catchAsync(async(req, res, next) => {
  const { id } = req.params;
  const { comment, rating} = req.body;

  con.query(
    "INSERT INTO reviews (comment, rating, id_camp) VALUES (?, ?, ?)", 
    [comment, rating, id],
    function (err, result) {
      if (err) {
        console.error('Error inserting review:', err);
        res.status(500).send("Erro ao inserir a avaliação no banco de dados.");
        return;
      }

      console.log('Review inserted successfully:', result);
      res.redirect(`/campgrounds/${id}`); 
    }
  );
}))

app.delete("/campgrounds/:id/reviews/:reviewId", async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    con.query(`DELETE FROM reviews WHERE id = ${reviewId}`, function (err) {
      if (err) throw err;
      res.redirect(`/campgrounds/${id}`);
    });
  } catch (err) {
    console.log(err);
  }
});



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
