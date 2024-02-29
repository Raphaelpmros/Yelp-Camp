const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const con = require("../database/db");
const { isLoggin } = require("../middleware");

const allCampgrounds = new Promise((resolve, reject) => {
  con.query("SELECT * FROM campground", function (err, result) {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

router.get("/", async (req, res) => {
  const campgrounds = await allCampgrounds;
  res.render("campgrounds/index", { campgrounds });
});

router.get("/new", isLoggin, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  isLoggin,
  catchAsync(async (req, res) => {
    const { title, price, description, location, image } = req.body;
    const id_user = res.locals.user;
    console.log('aqui')
    console.log(id_user)
    const author = req.user.id;
    con.query(
      "INSERT INTO campground (title, price, description, location, image, author) VALUES (?, ?, ?, ?, ?, ?)",
      [title, price, description, location, image, author],
      function (err, result) {
        if (err) {
          console.error(err);
          return res.status(500).send("Erro ao cadastrar o acampamento.");
        }
        const campground = result.insertId;
        req.flash("success", "Successfully made a new campground!");
        res.redirect(`/campgrounds/${campground}`);
      }
    );
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    try {
      const { id } = req.params;

      con.query(
        `SELECT campground.*, author.username 
         FROM campground 
         JOIN user AS author ON campground.author = author.id 
         WHERE campground.id = '${id}'`,
        function (err, campgroundResult, fields) {
          if (err) {
            console.error(err);
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
            return;
          }

          if (campgroundResult && campgroundResult.length > 0) {
            const campground = campgroundResult[0];

            con.query(
              `SELECT * FROM reviews WHERE id_camp = '${id}'`,
              function (err, reviewsResult, fields) {
                if (err) {
                  console.error(err);
                  req.flash("error", "Something went wrong");
                  res.redirect("/campgrounds");
                  return;
                }

                const reviews = reviewsResult || [];
                const username = campground.username;
                res.render("campgrounds/show", { campground, reviews, username });
              }
            );
          } else {
            req.flash("error", "Cannot find this campground 1");
            res.redirect("/campgrounds");
          }
        }
      );
    } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong");
      res.redirect("/campgrounds");
    }
  })
);


router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    try {
      const { id } = req.params;

      con.query(
        `SELECT * FROM campground WHERE id = '${id}'`,
        function (err, result) {
          if (err) {
            console.error(err);
            req.flash("error", "Cannot find this campground");
            res.redirect("/campgrounds");
            return;
          }

          if (result.length === 0) {
            req.flash("error", "Cannot find this campground");
            res.redirect("/campgrounds");
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
  })
);

router.post("/:id/edit", async (req, res) => {
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
        req.flash("success", "Successfully edited the campground!");
        res.redirect("/campgrounds");
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno do servidor.");
  }
});

router.delete("/:id/", isLoggin, async (req, res) => {
  try {
    const { id } = req.params;
    con.query(`DELETE FROM reviews WHERE id_camp = ${id}`, function (err) {
      if (err) throw err;
    });

    con.query(`DELETE FROM campground WHERE id = ${id}`, function (err) {
      if (err) throw err;
      req.flash("success", "Successfully deleted the campground!");
      res.redirect("/campgrounds");
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
