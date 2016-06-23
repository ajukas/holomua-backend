'use strict';

angular.module('holomuaBackendApp')
  .controller('CityCtrl', function ($scope, $state, City, CityService) {

    var vm = this;
    vm.model = {};
    vm.alert = {
      type: '',
      msg: ''
    };

    vm.init = function(){
      vm.model = City;
      CityService.set(vm.model);
    };

    vm.save = function(){
      CityService.save().then(function(success){
        if (vm.model._id == null){
          $state.go('city', {id:success._id}, {notify: false});
          vm.model._id = success._id;
        }
        vm.alert.type = 'success';
        vm.alert.msg = 'city saved';
      }, function(err){
        vm.alert.type = 'danger';
        vm.alert.msg = err;
      });
    }

  }
);
