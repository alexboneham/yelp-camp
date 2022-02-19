// First draft for Yelp Camp application
const express = require('express');
const res = require('express/lib/response');
const mongoose = require('mongoose');
const path = require('path');
const { title } = require('process');
const Campground = require('./models/campground'); // Capitalized because it is a Model
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');

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

app.get('/campgrounds', async (req, res) => {
    // Display all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

// Serve route new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

// Serve route to edit campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})

// PUT route to update campground edit
app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true }) 
    // Used spread here in vid, not sure why. Also don't need new: true
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
})


app.get('/campgrounds/:id', async (req, res) => {
    // Show page for singular campground
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
})


app.listen(3000, () => {
    console.log("LISTENING ON 3000")
})