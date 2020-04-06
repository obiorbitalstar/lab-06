'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.status(200).send('Home Page!');
});

app.get('/location', (request, response) => {
  try {
    const geoData = require('./data/geo.json');
    const city = request.query.city;
    const locationData = new Location(city, geoData);
    response.status(200).json(locationData);
  } catch (error) {
    errorHandler(error, request, response);
  }
});
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
///////////////////////////////////////////////////////////
app.get('/weather', (request, response) => {
  try {
    const forecast = require('./data/darksky.json');
    const weatherData =[];
    forecast.data.forEach(element => {
      weatherData.push(new Weather(element));
    });
    console.log(weatherData);
    response.status(200).json(weatherData);
  } catch (error) {
    errorHandler(error, request, response);
  }
}
);
function Weather(sky) {
  this.forecast = sky.weather.description;
  this.time = new Date(sky.valid_date).toDateString();
}
app.use('*', notFoundHandler);
function notFoundHandler(request, response) {
  response.status(500).send('Sorry, something went wrong');
}
function errorHandler(error, request, response) {
  response.status(500).send(error);
}
app.listen(PORT, () => console.log(`the server is up and running on ${PORT}`));
