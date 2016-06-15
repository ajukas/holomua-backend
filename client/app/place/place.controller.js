'use strict';

angular.module('holomuaBackendApp')
  .controller('PlaceCtrl', function ($scope, Place, PlaceService) {

    var vm = this;

    vm.init = function(){
      vm.model = Place;
    };

  }
);
