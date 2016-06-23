/**
 * External Google API requests
 */
'use strict';

var config = require('./config');
var APIWebService = {};
var http   = require('https');
var q      = require('q');
var _      = require('lodash');
var querystring = require("querystring");

APIWebService.getPlaces = function(location, pageToken){
  var parameters = {};
  if (!_.isNil(pageToken)) {
    parameters.pagetoken = pageToken;
  } else {
    parameters.location = location.lat+','+location.lng;
    parameters.radius = config.api.radius;
  }
  var requestPath = '?'+querystring.stringify(parameters);
  var deferred = q.defer();
  executeRequest(requestPath, null, 'json', 'GET', null, function(err, data){
    if (err === true) {
      deferred.reject(data);
    } else {
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

function executeRequest(path, contentType, accept, method, body, callback){
  var header = {};
  if (contentType !== null){
    header = { 'Content-Type': 'application/'+contentType, 'Accept': 'application/json' };
  }
	if(!_.isNil(accept)) { header['Accept'] =  'application/' + accept; }
  var requestPath = config.api.path+accept+path+"&key="+config.api.key;
  var options = {
	  host: config.api.url,
	  path: requestPath,
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
        result = !_.isEmpty(result) ? JSON.parse(result):{};
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
    req.write(body, 'utf8');
  }
  req.end();
};

function log(status, options, result){
  if (config.logging){
    if (result === undefined) {
      result = {};
    }
    console.log(Date.now()+'-ENGINE-'+status, 'OPTIONS-'+JSON.stringify(options), 'RESULT-'+JSON.stringify(result));
  }
};

module.exports = APIWebService;
