'use strict';

angular.module('holomuaBackendApp').service('PlaceService', function($resource, $http, resourceFactory){

  var _key = '_id';
  var _place = {};

  var _error;

  var _resource = resourceFactory.get('places');

  this.init = function(){
    _place = {};
    _place[_key]          = null;
    _place['name']        = '';
    _place['description'] = '';
  };

  this.get = function(){
    return _place;
  };

  this.search = function(params){
    return _resource.get(params);
  };

  this.getAll = function(){
    return _resource.all();
  };

});
