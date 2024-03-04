const con = require("../database/db");
const { isLoggin } = require("../middleware");

module.exports.createReview = async (req, res, next) => {
  const { id } = req.params;
  const { comment, rating } = req.body;
  const author = req.user;

  con.query(
    "INSERT INTO reviews (comment, rating, id_camp, author) VALUES (?, ?, ?, ?)",
    [comment, rating, id, author],
    function (err, result) {
      if (err) {
        console.error("Error inserting review:", err);
        res.status(500).send("Erro ao inserir a avaliação no banco de dados.");
        return;
      }

      req.flash("success", "Successfully created a new review!");
      res.redirect(`/campgrounds/${id}`);
    }
  );
  isLoggin;
};

module.exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    con.query(`DELETE FROM reviews WHERE id = ${reviewId}`, function (err) {
      if (err) throw err;
      req.flash("success", "Successfully deleted the review!");
      res.redirect(`/campgrounds/${id}`);
    });
  } catch (err) {
    console.log(err);
  }
};
