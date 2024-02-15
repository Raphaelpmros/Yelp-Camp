const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const con = require("./database/db");
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

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

app.post("/campgrounds", async (req, res) => {
  try {
    const { title, price, description, location } = req.body;
    con.query(
      "INSERT INTO campground (title, price, description, location) VALUES (?, ?, ?, ?)",
      [title, price, description, location],
      function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send("Erro ao salvar o produto no banco de dados.");
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

app.get("/campgrounds/:id", async (req, res) => {
  try {
    const { id } = req.params;
    con.query(
      `SELECT * FROM campground WHERE id = '${id}'`,
      function (err, result, fields) {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (result.length === 0) {
          res.status(404).send("Campground not found");
          return;
        }
        const campground = result[0]; 
        console.log(campground);
        res.render("campgrounds/show", { campground }); 
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/campgrounds/:id/edit", async (req, res) => {
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
});

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
    con.query(`DELETE FROM campground WHERE id = ${id}`, function (err) {
      if (err) throw err;
      res.redirect("/campgrounds");
    });
  } catch (err) {
    console.log(err);
  }
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database");
});

app.listen(3000, () => {
  console.log("listenning on port 3000");
});
