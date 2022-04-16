// First draft for Yelp Camp application
const express = require("express");
const app = express();
const res = require("express/lib/response");
const mongoose = require("mongoose");
const path = require("path");
const { title } = require("process");
const Campground = require("./models/campground"); // Capitalized because it is a Model
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const { join } = require("path");
const { isError } = require("joi");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

// Connect mongoose database
mongoose.connect("mongodb://localhost:27017/yelp-camp");

// Handle errors connecting to db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Set up remaining tools
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set up tools for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ROUTES
app.get("/", (req, res) => {
  res.render("home");
});

// All campground routes
app.use("/campgrounds", campgrounds);

// All reviews routes
app.use("/campgrounds/:id/reviews", reviews);

app.all("*", (req, res, next) => {
  // Run on any path (*) if nothing else is matched
  next(new ExpressError("Page Not Found", 404)); // This will be passed onto the error handler through next()
});

// Add Express Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("LISTENING ON 3000");
});
