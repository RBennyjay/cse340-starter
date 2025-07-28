const Util = require("./index"); // adjust path if needed

async function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Server Error";

  let nav;
  try {
    nav = await Util.getNav();
  } catch (navErr) {
    nav = "<ul><li>Home</li></ul>"; // Fallback nav
  }

  res.status(status).render("errors/error", {
    title: "Error",
    message,
    nav, // ✅ required for layout/partials
  });
}

module.exports = errorHandler;
