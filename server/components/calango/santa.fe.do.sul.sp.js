/**
 * StaFe crawler
 */
'use strict';

var _ = require('lodash');
var StaFe = {};
var self = this;
var request = require('request');
var cheerio = require('cheerio');
var Place = require('../../api/place/place.model');
var util = require('util');

StaFe.start = function(calangoRequest, city){
  // crawAcesantafe('a', city);
  crawListao({category: 1, page: 1}, city);
};

function crawListao(query, city){
  var getRequest = {
    url:'http://listao.net/plus/modulos/conteudo/?tac=estabelecimentos&busca_from=categoria&filter_categoria='+query.category+'&pagina='+query.page
  };
  console.log("Starting StaFe Crawler for Query: "+query.category+" Page:"+query.page);
  request.get(getRequest, function(error, response, body){
    var $ = cheerio.load(body);
    var category = $('h1').text();
    var places = [];
    $('.estabelecimento_info').each(function(i, elem){
      var place = {
        name:    $(this).children('.estabelecimentoListaItemTitulo').text().trim(),
        placeId: $(this).children('.estabelecimentoListaItemTitulo').text().trim(),
        phones: [],
        source: 'listao',
        category: category
      }
      $(this).children('.estabelecimentoListaItemTelefone').each(function(i, elem){
        _.forEach($(this).children('.tel_estab').text().split('*'), function(phone){
          place.phones.push(phone.trim());
        });
      });
      var address = $(this).children('.estabelecimentoListaItemEndereco').text().trim().replace(/(\r\n|\n|\r)/gm,"").split(',');
      place.street = address[0];
      var complements = address[1].split(' - ');
      place.number =   _.isNil(complements[0]) ? '' : complements[0].trim();
      place.cityName = _.isNil(complements[1]) ? '' : complements[1].trim();;
      place.state =    _.isNil(complements[2]) ? '' : complements[2].trim();;
      place.cep =      _.isNil(complements[3]) ? '' : complements[3].trim();;
      places.push(place);
    });

    bulkInsertPlaces(places, city, 'listao', function(err, result){

      if ($('.estabelecimentoEmpty').text() == '') {
        query.page += 1;
        crawListao(query, city);
      } else if (query.category <= 30) {
        query.page = 1;
        query.category += 1;
        crawListao(query, city);
      }

    });

  });
};

function bulkInsertPlaces(places, city, source, callback){
  var bulk = Place.collection.initializeOrderedBulkOp();
  console.log(places);
  _.forEach(places, function(place){
    bulk.find({name: place.name, source: source}).upsert().updateOne({
      name:     place.name,
      placeId:  place.placeId,
      street:   place.street,
      number:   place.number,
      phones:   place.phones,
      cityName: place.cityName,
      state:    place.state,
      cep:      place.cep,
      category: place.category,
      source:   place.source,
      city: city._id
    });
  });
  if (places.length > 0) {
    bulk.execute(function(err, result){
      if (err) { console.log(err.toString()); }
      console.log("Inserted:  "+result.nInserted);
      console.log("nUpserted: "+result.nUpserted);
      console.log('Inserted register StaFe');
      callback(err, result);
    });
  } else {
    callback(false, places);
  }

};

function crawAcesantafe(query, city){
  var postRequest = {
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:     'http://acesantafe.com.br/guia-do-comercio',
    body:    "nome="+query
  };
  console.log("Starting StaFe Crawler for Query: "+query);
  request.post(postRequest, function(error, response, body){
    if (!error){
      var places = processHTML(body);
      console.log("Crawler Query Result: "+places.length);

      bulkInsertPlaces(places, city, 'acesantafe', function(err, result){
        var queryCharCode = query.charCodeAt(0);
        if (queryCharCode < 122){
          crawAcesantafe(String.fromCharCode(queryCharCode+1), city);
        }
      });
    } else {
      console.log('Error crawling StaFe');
    }
  });
};

function processHTML(body){
  var $ = cheerio.load(body);
  var result = [];
  $('.well').each(function(i, elem){
    var place = {
      name: '',
      street: '',
      number: '',
      phones: '',
      cityName: '',
      category: '',
      source: 'acesantafe',
      rawData: $(this).text()
    };
    //Parse name and category
    var header = $(this).children('h5').text().split('>');
    if (header.length >= 2){
      place.category = header[0].trim();
      place.name = header[1].trim();
    } else {
      place.name = header[0].trim();
    }
    place.placeId = place.name;
    //Parse address
    var content    = $(this).children('p').text().split('/');
    place.cityName = content[0].trim();
    var address    = content[1].split(',');
    place.street   = address[0].trim();
    if (undefined !== address[1]) {
      var numbers = address[1].split('.');
      place.number = numbers[0].trim();
      place.phones = [numbers[numbers.length-1]];
    } else {
      // console.log(content);
    }
    result.push(place);
  });
  return result;
};

module.exports = StaFe;
