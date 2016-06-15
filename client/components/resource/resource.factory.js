'use strict';

angular.module('holomuaBackendApp').factory('resourceFactory', function($resource) {
  return {
    get: function (name) {
      return $resource('/api/'+name+'/:id', {}, {
        update: {method:'PUT'},
        get:    {method:'GET'},
        all:    {method:'GET', isArray:true},
        create: {method:'POST'},
        delete: {method:'DELETE'},
      });
    },
  };
});
