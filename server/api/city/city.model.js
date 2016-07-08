'use strict';

var crawlerStatus = {
  new:        'crawling.new',
  start:      'crawling.start',
  processing: 'crawling.processing',
  done:       'crawling.done'
};

var _ = require('lodash');
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var Place = require('../place/place.model');
var googleAPI = require('../../components/placesAPIWebService');
var Calango = require('../../components/calango');

var CitySchema = new Schema({
  name: String,
  description: String,
  googlePlacesKey: {type: String, unique: true},
  apiKey: {type: String, unique: true},
  active: Boolean,
  crawlerStatus: {type: String, default: crawlerStatus.new},
  location: {
    lat: Number,
    lng: Number
  }
});

CitySchema.statics.crawlerStatus = crawlerStatus;

CitySchema.methods.crawl = function(type, callback){
  var self = this;
  if (type === undefined || type === 'googlePlacesAPI') {
    console.log(self);
    googleAPI.getPlaces(self.location).then(function(result){
      self.crawlerStatus = crawlerStatus.start;
      self.save(function (err) {
        callback(err, self);
      });
    });
  } else if (type === 'custom') {
    Calango.craw(self, function(err, result){
      callback(err, result);
    });
  }
};

CitySchema.methods.googlePlacesCrawl = function(places){

  var self = this;

  var bulk = Place.collection.initializeOrderedBulkOp();
  _.forEach(places.results, function(place){
    bulk.find({placeId: place.place_id}).upsert().updateOne({name: place.name, placeId: place.place_id});
  });
  bulk.execute(function(err, result){
    if (!_.isNil(places.next_page_token)) {
      //Set timeout so the places api dont invalid the request
      setTimeout(function() {
        googleAPI.getPlaces(null, places.next_page_token).then(function(result){
          self.googlePlacesCrawl(result);
        });
      }, 2000);
    }
  });

};

module.exports = mongoose.model('City', CitySchema);
