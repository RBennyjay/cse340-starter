const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../utilities/review-validate")

router.post(
  "/add",
  utilities.checkLogin,  // Only allow logged-in users
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  reviewController.postReview
)



module.exports = router
