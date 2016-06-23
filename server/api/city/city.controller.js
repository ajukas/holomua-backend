'use strict';

var _ = require('lodash');
var City = require('./city.model');
var startCrawlerStatus = [City.crawlerStatus.done, City.crawlerStatus.new];
var googleAPI = require('../../components/placesAPIWebService');

// Start a city crawler
exports.crawler = function(req, res) {
  City.findOne({googlePlacesKey: req.params.city}, function (err, city) {
    if(err) { return handleError(res, err); }
    googleAPI.getPlaces(city.location).then(function(result){
      city.crawlerStatus = City.crawlerStatus.start;
      city.save(function (err) {
        if (err) { return handleError(res, err); }
        city.crawl(result);
        return res.status(200).json(city);
      });
    });
    // //Start Crawler
    // if (-1 != startCrawlerStatus.indexOf(city.crawlerStatus)) {
    //
    // } else {
    //   return res.status(200).json(city);
    // }
  });
};

// Get list of Cities
exports.index = function(req, res) {
  City.find(function (err, cities) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(cities);
  });
};

// Get a single City
exports.show = function(req, res) {
  City.findById(req.params.id, function (err, city) {
    if(err) { return handleError(res, err); }
    if(!city) { return res.status(404).send('Not Found'); }
    return res.json(city);
  });
};

// Creates a new City in the DB.
exports.create = function(req, res) {
  City.create(req.body, function(err, city) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(city);
  });
};

// Updates an existing City in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  City.findById(req.params.id, function (err, city) {
    if (err) { return handleError(res, err); }
    if(!city) { return res.status(404).send('Not Found'); }
    var updated = _.merge(city, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(city);
    });
  });
};

// Deletes a City from the DB.
exports.destroy = function(req, res) {
  City.findById(req.params.id, function (err, city) {
    if(err) { return handleError(res, err); }
    if(!city) { return res.status(404).send('Not Found'); }
    city.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
