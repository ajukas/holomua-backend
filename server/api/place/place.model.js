'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var mongooseToCsv = require("mongoose-to-csv");

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

PlaceSchema.plugin(mongooseToCsv, {
  headers: 'Name Street Category Phones',
  constraints: {
    'Name': 'name',
    'Street': 'street',
    'Category': 'category'
  },
  virtuals: {
    'Phones': function(doc) {
      return doc.phones.join(',');
    }
  }
});

module.exports = mongoose.model('Place', PlaceSchema);
