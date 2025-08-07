const jwt = require("jsonwebtoken");

module.exports = function (roles = []) {
  return (req, res, next) => {
    const accessToken = req.cookies.jwt;

    if (!accessToken) {
      req.flash("notice", "Please log in.");
      req.flash("messageType", "error"); 
      return res.redirect("/account/login");
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const userRole = decoded.account_type;

      if (roles.includes(userRole)) {
        return next();
      } else {
        req.flash("notice", "You do not have access to this page.");
        req.flash("messageType", "error"); 
        return res.redirect("/account/");
      }
    } catch (err) {
      req.flash("notice", "Invalid login.");
      req.flash("messageType", "error"); 
      return res.redirect("/account/login");
    }
  };
};
