'use strict';

angular.module('holomuaBackendApp')
  .config(function ($stateProvider) {
    $stateProvider
    .state('listPlaces', {
      url: '/places/all',
      templateUrl: 'app/place/list.html',
      controller: 'PlacesListCtrl',
      controllerAs: 'Places',
      resolve: {
        Places: function(PlaceService){
          return PlaceService.getAll();
        },
      }
    })
    .state('place', {
      url: '/places/:id',
      templateUrl: 'app/place/place.html',
      controller: 'PlaceCtrl',
      controllerAs: 'Place',
      resolve: {
        Place: function(PlaceService, $stateParams){
          if (!_.isNil($stateParams.id) && $stateParams.id !== ""){
            return PlaceService.search({ id : $stateParams.id }).$promise;
          }
          PlaceService.init()
          return PlaceService.get();
        },
      }
    });
  });
