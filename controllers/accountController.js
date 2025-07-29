const utilities = require("../utilities")

const buildLogin = async (req, res) => {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    message: req.flash("message") // Ensures 'message' is defined
  })
}

module.exports = { buildLogin }
