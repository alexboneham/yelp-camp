// First draft for Yelp Camp application
const express = require('express');
const app = express();
const res = require('express/lib/response');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const { title } = require('process');
const Campground = require('./models/campground'); // Capitalized because it is a Model
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const { join } = require('path');
const { isError } = require('joi');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

// Connect mongoose database
mongoose.connect('mongodb://localhost:27017/yelp-camp');

// Handle errors connecting to db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

// Set up remaining tools
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up tools for parsing form data, etc
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Set up sessions and flash
const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires one week from now
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// ROUTES
app.get('/', (req, res) => {
  res.render('home');
});

// Flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.all('*', (req, res, next) => {
  // Run on any path (*) if nothing else is matched
  next(new ExpressError('Page Not Found', 404)); // This will be passed onto the error handler through next()
});

// Add Express Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('LISTENING ON 3000');
});
