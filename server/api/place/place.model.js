'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaceSchema = new Schema({
  name: String,
  description: String,
  active: Boolean
});

module.exports = mongoose.model('Place', PlaceSchema);
