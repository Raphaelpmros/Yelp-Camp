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

module.exports.index = async (req, res) => {
  const campgrounds = await allCampgrounds;
  res.render("campgrounds/index", { campgrounds });
};

module.exports.newCampgroundForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  const images = req.files.map(f => ({url: f.path}))
  const { title, price, description, location } = req.body;
  console.log(images);
  con.query(
    "INSERT INTO campground (title, price, description, location, image, author) VALUES (?, ?, ?, ?, ?, ?)",
    [title, price, description, location, images, req.user],
    function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send("Erro ao cadastrar o acampamento.");
      }
      const campground = result.insertId;
      req.flash("success", "Successfully made a new campground!");
      return res.redirect(`/campgrounds/${campground}`);
    }
  );
};

module.exports.showCampground = async (req, res) => {
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
              res.render("campgrounds/show", {
                campground,
                reviews,
                username,
              });
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
};

module.exports.editCampgroundForm = async (req, res) => {
  try {
    const { id } = req.params;

    con.query(
      `SELECT * FROM campground WHERE id = '${id}'`,
      function (err, result) {
        if (err || result.length === 0) {
          console.error(err || "No campground found");
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
};

module.exports.saveEditForm = async (req, res) => {
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
};

module.exports.deleteCampground = async (req, res) => {
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
};
