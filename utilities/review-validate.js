const { body, validationResult } = require("express-validator")
const utilities = require(".")

const reviewValidate = {}

reviewValidate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Review must be at least 3 characters long.")
  ]
}

reviewValidate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("error", errors.array().map(e => e.msg).join(", "))
    return res.redirect(`/inventory/detail/${req.body.inv_id}`)
  }
  next()
}

module.exports = reviewValidate
