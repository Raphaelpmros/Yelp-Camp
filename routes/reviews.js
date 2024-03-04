const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const con = require("../database/db");
const reviews = require("../controllers/reviews");
const { isReviewAuthor } = require("../middleware");

router.post("/", catchAsync(reviews.createReview));

router.delete("/:reviewId", isReviewAuthor, reviews.deleteReview);

module.exports = router;
