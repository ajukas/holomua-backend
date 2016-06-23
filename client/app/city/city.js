'use strict';

angular.module('holomuaBackendApp')
  .config(function ($stateProvider) {
    $stateProvider
    .state('listCities', {
      url: '/cities/all',
      templateUrl: 'app/city/list.html',
      controller: 'CityListCtrl',
      controllerAs: 'Cities',
      resolve: {
        Cities: function(CityService){
          return CityService.getAll();
        },
      }
    })
    .state('city', {
      url: '/cities/:id',
      templateUrl: 'app/city/city.html',
      controller: 'CityCtrl',
      controllerAs: 'City',
      resolve: {
        City: function(CityService, $stateParams){
          if (!_.isNil($stateParams.id) && $stateParams.id !== ""){
            return CityService.search({ id : $stateParams.id }).$promise;
          }
          CityService.init();
          return CityService.get();
        },
      }
    });
  });
