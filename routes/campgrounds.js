const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const con = require("../database/db");
const { isLoggin, isAuthor } = require("../middleware");
const campground = require("../controllers/campgrounds");

router.get("/", catchAsync(campground.index));

router.get("/new", isLoggin, catchAsync(campground.newCampgroundForm));

router.post("/", isLoggin, catchAsync(campground.createCampground));

router.get("/:id", catchAsync(campground.showCampground));

router.get("/:id/edit", isAuthor, catchAsync(campground.editCampgroundForm));

router.post("/:id/edit", catchAsync(campground.saveEditForm));

router.delete("/:id/", isLoggin, catchAsync(campground.deleteCampground));

module.exports = router;
