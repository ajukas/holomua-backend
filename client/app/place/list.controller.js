'use strict';

angular.module('holomuaBackendApp')
  .controller('PlacesListCtrl', function ($scope, Places, PlaceService) {

    var vm = this;

    vm.init = function(){
      vm.all = Places;
    };

  }
);
