/**
 * Craw places pages
 */
'use strict';

var config = require('./config');
var Calango = {};
var http   = require('http');
var q      = require('q');
var _      = require('lodash');
var querystring = require("querystring");
var self = this;

Calango.craw = function(city, callback){
  console.log('Calango is now Crawling');
  try {
    var crawler = require('./'+city.apiKey.split('_').join('.'));
    callback(false, crawler.start(executeRequest, city));
  } catch (ex) {
    console.log(ex);
    callback(true, ex);
  }
};

var executeRequest = function(host, path, contentType, accept, method, body, callback){
  var header = {};
  if (contentType !== null){
    header = { 'Content-Type': 'application/'+contentType, 'Accept': 'application/json' };
  }
	if(!_.isNil(accept)) { header['Accept'] =  'application/' + accept; }
  var options = {
	  host: host,
	  path: path,
	  method: method,
	  headers: header
	};
	//request
	var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    if (res.statusCode === 200){
      var result = '';
      res.on('data', function (chunk) {
        result += chunk;
      });
  	  res.on('end', function() {
        if(_.isEmpty(result)){
          return callback(false, {headers: res.headers, status: res.statusCode, result:result});
        }
        return callback(false, result);
  	  });
    } else {
      var result = '';
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function() {
        log('error', options, {headers: res.headers, result:result});
        return callback(true, {headers: res.headers, status: res.statusCode, result:result});
  	  });
    }
	});
  //error on request treatment
	req.on('error', function(e) {
    log('error', options, e);
    return callback(true, new Error("Unable to execute request"));
	});
  if (body !== null){
    if (contentType === 'json'){ body = JSON.stringify(body); }
    else { body = querystring.stringify(body); }
    req.write(body, 'utf8');
  }
  req.end();
};

function log(status, options, result){
  if (config.logging){
    if (result === undefined) {
      result = {};
    }
    console.log(Date.now()+'-CALANGO-'+status, 'OPTIONS-'+JSON.stringify(options), 'RESULT-'+JSON.stringify(result));
  }
};

module.exports = Calango;
