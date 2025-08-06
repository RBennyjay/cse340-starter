const reviewModel = require("../models/reviewModel")

const reviewController = {}

reviewController.postReview = async function (req, res) {
  const { inv_id, review_text, rating } = req.body;
  const account_id = res.locals.accountData?.account_id;

  try {
    await reviewModel.addReview(inv_id, account_id, review_text, rating);
    req.flash("success", "Review submitted successfully.");
  } catch (error) {
    console.error("Review submission error:", error);
    req.flash("error", "Error submitting review.");
  }

  res.redirect(`/inv/detail/${inv_id}`);
};

module.exports = reviewController
