const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const con = require("../database/db");


router.post(
  "/",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { comment, rating } = req.body;

    con.query(
      "INSERT INTO reviews (comment, rating, id_camp) VALUES (?, ?, ?)",
      [comment, rating, id],
      function (err, result) {
        if (err) {
          console.error("Error inserting review:", err);
          res
            .status(500)
            .send("Erro ao inserir a avaliação no banco de dados.");
          return;
        }

        console.log("Review inserted successfully:", result);
        res.redirect(`/campgrounds/${id}`);
      }
    );
  })
);

router.delete("/:reviewId", async (req, res) => {
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

module.exports = router;