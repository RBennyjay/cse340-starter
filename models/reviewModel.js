const pool = require("../database/")

const reviewModel = {}

// Add a new review
reviewModel.addReview = async function (inv_id, account_id, review_text, rating) {
  try {
    const sql = `
      INSERT INTO reviews (inv_id, account_id, review_text, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `
    const result = await pool.query(sql, [inv_id, account_id, review_text, rating])
    return result.rows[0] // Or return result.rows for multiple
  } catch (error) {
    throw new Error("Error adding review: " + error.message)
  }
}

// Get reviews for a specific vehicle
reviewModel.getReviewsByInvId = async function (inv_id) {
  try {
    const sql = `
      SELECT r.review_text, r.review_date, r.rating, a.account_firstname, a.account_lastname
      FROM reviews r
      JOIN "account" a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `
    const data = await pool.query(sql, [inv_id])

    return data.rows // for PostgreSQL
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("Error fetching reviews: " + error.message)
  }
}

module.exports = reviewModel