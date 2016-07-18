'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaceSchema = new Schema({
  name: String,
  placeId: String,
  street: String,
  number: String,
  phones: [String],
  cityName: String,
  category: String,
  cep: String,
  state: String,
  source: String,
  rawData: String,
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
});

module.exports = mongoose.model('Place', PlaceSchema);
