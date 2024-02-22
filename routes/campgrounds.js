const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const con = require("../database/db");

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

router.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  catchAsync(async (req, res) => {
    const { title, price, description, location, image } = req.body;
    con.query(
      "INSERT INTO campground (title, price, description, location, image) VALUES (?, ?, ?, ?, ?)",
      [title, price, description, location, image],
      res.redirect(`/campgrounds/${campground.id}`)
    );
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
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

        res.redirect("/campgrounds");
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno do servidor.");
  }
});

router.delete("/:id/", async (req, res) => {
  try {
    const { id } = req.params;
    con.query(`DELETE FROM reviews WHERE id_camp = ${id}`, function (err) {
      if (err) throw err;
    });

    con.query(`DELETE FROM campground WHERE id = ${id}`, function (err) {
      if (err) throw err;
      res.redirect("/campgrounds");
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
