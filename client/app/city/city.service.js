'use strict';

angular.module('holomuaBackendApp').service('CityService', function($resource, $http, resourceFactory){

  var _key = '_id';
  var _city = {};

  var _error;

  var _resource = resourceFactory.get('cities');

  this.init = function(){
    _city = {};
    _city[_key]          = null;
    _city['name']        = '';
    _city['description'] = '';
    _city['googlecitysKey'] = '';
    _city['categories'] = [];
  };

  this.get = function(){
    return _city;
  };

  this.set = function(city){
    _city = city;
  };

  this.search = function(params){
    return _resource.get(params);
  };

  this.getAll = function(){
    return _resource.all();
  };

  this.save = function () {
    if (_city[_key] === null || _city[_key] === undefined) {
      //removing null key so the api can return the new key
      delete _city[_key];
      return _resource.create(_city).$promise;
    } else {
      return _resource.update({id: _city[_key]}, _city).$promise;
    }
  };

});
