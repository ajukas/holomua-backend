'use strict';

var _ = require('lodash');
var City = require('./city.model');
var Place = require('../place/place.model');
var fs = require('fs');
var archiver = require('archiver');
var zipArchive = archiver('zip');
var startCrawlerStatus = [City.crawlerStatus.done, City.crawlerStatus.new];
var googleAPI = require('../../components/placesAPIWebService');
var zip = new require('node-zip')();
var fs = require("fs");

// Start a city crawler
exports.crawler = function(req, res) {
  City.findOne({apiKey: req.params.city}, function (err, city) {
    if(err) { return handleError(res, err); }
    city.crawl(req.query.t, function(err, result){
      if (err) { return handleError(res, err); }
      return res.status(200).json(city);
    });
  });
};

// Create a city csv file
exports.export = function(req, res) {
  City.findOne({apiKey: req.params.city}, function (err, city) {
    if(err) { return handleError(res, err); }
    if (_.isNil(req.query.source)) { return handleError(res, {message: 'source is required'}); }
    Place.find({source: req.query.source, city: city._id}).exec().then(function(docs) {
      var outputFile = fs.createWriteStream(city.apiKey+'.'+req.query.source+'.places.csv');
      Place.csvReadStream(docs).pipe(outputFile);

      return res.status(200).json(city);
    });
  });
};

// Get list of places by apiKey and sourceId
exports.places = function(req, res) {
  City.findOne({apiKey: req.params.apiKey}, function (err, city) {
    if(err) { return handleError(res, err); }
    if (_.isNil(req.query.s)) {
      return res.status(400).json({err: 'missing source parameter'});
    }
    Place.find({city: city._id, source: req.query.s}, function(err, places){
      var result = city.toObject();
      result.places = places;
      if(err) { return handleError(res, err); }
      if (req.query.f === 'true'){
        var fileName = req.params.apiKey+'_'+req.query.s;
        zip.file(fileName+'.txt', JSON.stringify(result));
        var data = zip.generate({base64:false,compression:'DEFLATE'});
        fs.writeFileSync(fileName+'.zip', data, 'binary');
      }
      return res.status(200).json(result);
    }).select("name street number cityName state cep category phones");
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
    var updated = _.extend(city, req.body);
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
