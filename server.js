/******************************************
 * Primary server control file
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const session = require("express-session")
const flash = require("connect-flash")
const pgSession = require("connect-pg-simple")(session)
const cookieParser = require("cookie-parser")

const app = express()


const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const pool = require('./database/')
const bodyParser = require("body-parser")
const reviewRoute = require("./routes/reviewRoute")


// Serve static files
app.use(express.static("public"))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



/* ***********************
 * Session Middleware
 *************************/
app.use(session({
  store: new pgSession({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


app.use(cookieParser())
app.use(utilities.checkJWTToken) 

// Flash messages
app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout")

app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav()
  next()
})

/* ***********************
 * Static and Route Middleware
 *************************/
app.use(static)




// Home route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)


app.use("/reviews", reviewRoute)

// Account routes
app.use("/account", accountRoute)





/* ***********************
 * 404 Error Handling
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * General Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  console.error(`🔥 Error at: "${req.originalUrl}"`)
  console.error(err.stack)
  let nav = await utilities.getNav()
  let message = err.message || "Internal Server Error"
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Start the Server 
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
