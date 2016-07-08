/**business
 * StaFe crawler
 */
'use strict';

var _ = require('lodash');
var StaFe = {};
var self = this;
var request = require('request');
var cheerio = require('cheerio');
var Place = require('../../api/place/place.model');

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
        name: $(this).children('.estabelecimentoListaItemTitulo').text().trim(),
        phones: [$(this).children('.estabelecimentoListaItemTelefone').children('.tel_estab exibir_tel_estab_'+i).text().trim()],
        category: category
      }
      console.log($(this).children('.estabelecimentoListaItemTelefone')).children();
    });

    // if ($('.estabelecimentoEmpty').text() == '') {
    //   query.page += 1;
    //   crawListao(query, city);
    // } else if (query.category <= 30) {
    //   query.page = 1;
    //   query.category += 1;
    //   crawListao(query, city);
    // }
  });
};

function bulkInsertPlaces(places, city, source, callback){
  var bulk = Place.collection.initializeOrderedBulkOp();
  _.forEach(places, function(place){
    bulk.find({placeId: place.placeId, source: source}).upsert().updateOne({
      name:     place.name,
      placeId:  place.placeId,
      street:   place.street,
      number:   place.number,
      phones:   place.phones,
      cityName: place.cityName,
      category: place.category,
      source:   place.source,
      city: city._id
    });
  });
  bulk.execute(function(err, result){
    console.log("Inserted:  "+result.nInserted);
    console.log("nUpserted: "+result.nUpserted);
    console.log('Inserted register StaFe');
    callback(err, result);
  });
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
