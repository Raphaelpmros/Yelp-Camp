const con = require("../database/db");
const { storeReturnTo } = require("../middleware");
const bcrypt = require("bcrypt");
const salts = 10;

module.exports.renderFormUser = (req, res) => {
  res.render("users/register");
};

module.exports.createUser = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, salts);
    const sql = `INSERT INTO user (email, username, password) VALUES ('${email}', '${username}', '${passwordHash}')`;
    const result = await new Promise((resolve, reject) => {
      con.query(sql, function (err, result) {
        if (err) reject(err);
        resolve(result);
      });
    });
    req.flash("sucess", "Register complete");
    res.redirect("/login");
  } catch (error) {
    const errorMessage = error.message;
    req.flash("error", errorMessage);
    res.redirect("/register");
  }
};

module.exports.validateLogin = async function (username, password, done) {
  try {
    const rows = await new Promise((resolve, reject) => {
      con.query(
        "SELECT * FROM user WHERE username=?",
        [username],
        function (err, rows) {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    if (rows.length === 0) {
      return done(null, false, { message: "Usuário não encontrado." });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      console.log(user.id);
      return done(null, user.id);
    } else {
      return done(null, false, { message: "Senha incorreta." });
    }
  } catch (error) {
    return done(error);
  }
};

module.exports.showAfterLogin = (req, res) => {
  if (req.user) {
    con.query("SELECT * FROM user", function (err, result) {
      if (err) {
        console.error(err);
        console.error(err);
        res.redirect("/error");
        return;
      }
      res.locals.userData = result[0];
      res.render("show");
    });
  } else {
    res.redirect("/campgrounds/show", { user });
  }
};

module.exports.returnTo = (req, res) => {
  req.flash("sucess", "Wellcome to yelpCamp");
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
    }
    req.flash("sucess", "Goodbye!!!");
    res.redirect("/campgrounds");
  });
};
