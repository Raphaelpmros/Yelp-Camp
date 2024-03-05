const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggin, isAuthor } = require("../middleware");
const campground = require("../controllers/campgrounds");
const multer = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({storage})

router.get("/", catchAsync(campground.index));

router.post("/", isLoggin, upload.array('image'), catchAsync(campground.createCampground));

router.get("/new", isLoggin, campground.newCampgroundForm);

router.get("/:id", catchAsync(campground.showCampground));

router.get("/:id/edit", isAuthor, catchAsync(campground.editCampgroundForm));

router.post("/:id/edit", catchAsync(campground.saveEditForm));

router.delete("/:id/", isLoggin, catchAsync(campground.deleteCampground));

module.exports = router;
