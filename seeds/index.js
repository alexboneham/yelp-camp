// First draft for Yelp Camp application
const mongoose = require('mongoose');
const Campground = require('../models/campground'); // Capitalized because it is a Model
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');

// Connect mongoose database
mongoose.connect('mongodb://localhost:27017/yelp-camp');

// Handle errors connecting to db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'http://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure culpa, sit provident, esse autem, repellat quidem vel quo libero ut cupiditate reiciendis vitae iste aut non ratione necessitatibus quis a.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

