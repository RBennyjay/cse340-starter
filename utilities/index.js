const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  const data = await invModel.getClassifications()

  
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML
 *************************************** */
Util.buildClassificationGrid = async function (data) {
  if (!data.length) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  let grid = '<ul id="inv-display">'
  data.forEach((vehicle) => {
    grid += `
      <li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`
  })
  grid += "</ul>"
  return grid
}

/* **************************************
 * Build vehicle detail view
 *************************************** */
Util.buildVehicleDetailView = function (vehicle) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price)

  const miles = new Intl.NumberFormat().format(vehicle.inv_miles)

  return `
    <section class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Miles:</strong> ${miles}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </section>
  `
}

/* **************************************
 * Build dropdown list for classifications
 *************************************** */
// Util.buildClassificationList = async function (selectedId = "") {
//   const data = await invModel.getClassifications()
//   let list = '<select name="classification_id" id="classification_id" required>'
//   list += '<option value="">Choose a Classification</option>'
//   data.rows.forEach((row) => {
//     const selected = row.classification_id == selectedId ? "selected" : ""
//     list += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`
//   })
//   list += "</select>"
//   return list
// }

Util.buildClassificationList = async function (classification_id = null) {
  const classificationList = await invModel.getClassifications() 
  let data = '<select id="classificationList" name="classification_id">'
  data += '<option value="">Choose a classification</option>'
  classificationList.rows.forEach((row) => {
    data += `<option value="${row.classification_id}"`
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      data += " selected"
    }
    data += `>${row.classification_name}</option>`
  })
  data += "</select>"
  return data
}



/* **************************************
 * JWT Token Middleware (verifies & sets locals)
 *************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.locals.loggedIn = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.accountData = decoded;
    res.locals.account_type = decoded.account_type;
    res.locals.loggedIn = true;
  } catch (err) {
    res.clearCookie("jwt");
    res.locals.loggedIn = false;
  }

  return next();
};

// Util.checkAdmin = (req, res, next) => {
//   if (res.locals.account_type === "Admin") {
//     return next()
//   }
//     req.flash("notice", "Access denied. Admins only.");
//     req.flash("messageType", "error");
//     return res.redirect("/account");
//   };

Util.checkAdmin = (req, res, next) => {
  if (res.locals.accountData && res.locals.accountData.account_type === "Admin") {
    return next()
  }

  req.flash("notice", "Access denied. Admins only.")
  req.flash("messageType", "error")
  return res.redirect("/account")
}



/* **************************************
 * Protect Routes: Require Logged-In User
 *************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedIn) {
    return next()
  } 
    req.flash("notice", "Please log in to continue.")
    req.flash("messageType", "error")
    return res.redirect("/account/login")
  }

/* **************************************
 * General Error Handling Wrapper
 *************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
