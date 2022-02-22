// First draft for Yelp Camp application
const express = require('express');
const res = require('express/lib/response');
const mongoose = require('mongoose');
const path = require('path');
const { title } = require('process');
const Campground = require('./models/campground'); // Capitalized because it is a Model
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { join } = require('path');


// Connect mongoose database
mongoose.connect('mongodb://localhost:27017/yelp-camp');

// Handle errors connecting to db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Set up remaining tools
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up tools for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Set routes
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    // Display all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// Serve route new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// Create new campground in database
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    // Define Joi schema for campground
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Serve route to edit campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

// PUT route to update campground edit
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true })
    // Used spread here in vid, not sure why. Also don't need new: true
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}))


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // Show page for singular campground
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
}))

app.all('*', (req, res, next) => {
    // Run on any path (*) if nothing else is matched
    next(new ExpressError('Page Not Found', 404)); // This will be passed onto the error handler through next()
})

// Add Express Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("LISTENING ON 3000")
})