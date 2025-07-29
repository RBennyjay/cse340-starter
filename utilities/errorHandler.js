const Util = require("./index"); 

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
    nav, 
  });
}

module.exports = errorHandler;
