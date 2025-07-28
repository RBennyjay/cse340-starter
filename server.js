/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const inventoryRoute = require("./routes/inventoryRoute")
const errorHandler = require("./utilities/errorHandler");


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") 


/* ***********************
 * Routes
 *************************/
app.use(static)

//index route
// app.get("/", function  (req, res){
//   res.render("index", { title: "Home" })
// })
// app.get("/", baseController.buildHome)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Error handling route
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

app.use(require('./utilities/errorHandler'))


/* ***********************
* Express Error Handler

*************************/


app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  let message
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500 // fallback for local testing
const host = process.env.HOST || "localhost" // fallback for local testing

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
