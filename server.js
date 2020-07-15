'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 4000;
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());





app.get ('/',(request,response)=>{
  response.status(200).send('home page');
});


app.get('/location',locationHandler);


function locationHandler (request,response){
  const city = request.query.city ;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;

  superagent(url).then(res=>{
    const geoData = res.body;
    const locationData = new Location(city,geoData);
    response.status(200).json(locationData);
  }).catch(err => errorHandler(err,request,response));



}



function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
app.get('/test',(req,res)=>{
  const fname = req.query.fname;
  const lname=req.query.lname;
  const SQL ='INSERT INTO test(fname,lname) VALUES($1,$2) RETURNING *';
  const safevalues = [fname,lname];
  client.query(SQL,safevalues).then((results)=>{
    res.status(200).json(results.rows);

  }).catch(err =>{
    res.status(500).send(err);
  });
});

app.get('/testres',(req,res)=>{
  const SQL = 'SELECT * FROM test';
  client.query(SQL).then(results =>{
    res.status(200).json(results.rows);
  }).catch(err => res.status(500).send(err));
});

app.get('/weather',weatherHandler);


function weatherHandler (request,response){
  const city =request.query.search_query;
  const url =`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}`;
  superagent(url).then(weatherRes =>{

    const weatherSummary = weatherRes.body.data.map((day)=>{
      return new Weather(day);
    });
    response.status(200).json(weatherSummary);
  }).catch( err => errorHandler(err,request,response));


}
function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}

app.get('/trails',trailsHandler);

function trailsHandler (req,res){
  let arr=[];
  const key=process.env.TRAIL_API_KEY;
  const lat = req.query.latitude;
  const lon = req.query.longitude;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${key}`;
  superagent.get(url)
    .then(data =>{
      data.body.trails.map(element =>{
        const trial = new Trial(element);
        arr.push(trial);
      });
      res.send(arr);
    });
}

function Trial(walks){
  this.name= walks.name;
  this.location= walks.location;
  this.length = walks.length;
  this.stars = walks.stars;
  this.starVotes= walks.starVotes;
  this.summary= walks.summary;
  this.trail_url= walks.url;
  this.conditions= walks.conditionDetails;
  this.condition_date= walks.conditionDate.substring(0,11);
  this.condition_time = walks.conditionDate.substring(11);

}


function errorHandler(error,request,response){
  response.status(500).send(error);

}

client.on('error',err=>{
  throw new Error(err);
});

client.connect().then(()=>{
  app.listen(PORT , ()=>{
    console.log(`up and running on ${PORT}`);
  });
}).catch(err =>{
  throw new Error(`startup error ${err}`);
});
