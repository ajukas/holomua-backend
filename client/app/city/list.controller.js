'use strict';

angular.module('holomuaBackendApp')
  .controller('CityListCtrl', function ($scope, Cities, CityService) {

    var vm = this;

    vm.init = function(){
      vm.all = Cities;
    };

  }
);
