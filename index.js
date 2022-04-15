// First draft for Yelp Camp application
const express = require("express");
const res = require("express/lib/response");
const mongoose = require("mongoose");
const path = require("path");
const { title } = require("process");
const Campground = require("./models/campground"); // Capitalized because it is a Model
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { join } = require("path");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review");
const { isError } = require("joi");

const campgrounds = require("./routes/campgrounds");

// Connect mongoose database
mongoose.connect("mongodb://localhost:27017/yelp-camp");

// Handle errors connecting to db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Set up remaining tools
const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set up tools for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Define Joi validator middleware

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Set routes
app.get("/", (req, res) => {
  res.render("home");
});

// Moved campgrounds routes to separate file
app.use("/campgrounds", campgrounds);

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

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
