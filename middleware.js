const con = require("./database/db");

module.exports.isLoggin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must  be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  res.locals.user = req.user;
  next();
};

module.exports.isAuthor = (req, res, next) => {
  const { id } = req.params;
  con.query(`SELECT * FROM campground WHERE id = '${id}'`, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      req.flash("error", "An error occurred");
      res.redirect("/campgrounds");
      return;
    }

    const campground = results[0];
    if (!campground) {
      req.flash("error", "Campground not found");
      res.redirect("/campgrounds");
      return;
    }

    if (campground.author !== req.user) {
      req.flash("error", "You don't have permission to access this page");
      res.redirect("/campgrounds");
      return;
    }

    next();
  });
};

module.exports.isReviewAuthor = (req, res, next) => {
    const { id, reviewId } = req.params;
  
    con.query(`SELECT * FROM reviews WHERE id = ${reviewId}`, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        req.flash("error", "An error occurred while fetching review data");
        res.redirect(`/campgrounds/${id}`);
        return;
      }
  
      const review = results[0];
  
      if (!review) {
        req.flash("error", "Review not found");
        res.redirect(`/campgrounds/${id}`);
        return;
      }
  
      if (review.author !== req.user) {
        req.flash("error", "You don't have permission to access this page");
        res.redirect(`/campgrounds/${id}`);
        return;
      }
  
      next();
    });
  };
  
