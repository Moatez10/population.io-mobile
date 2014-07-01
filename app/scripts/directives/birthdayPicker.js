(function () {
  'use strict';

  angular.module('populationioApp')
    .directive('birthdayPicker', function () {
      return {
        restrict: 'A',
        scope: {
          ngModel: '='
        },
        link: function ($scope, element) {

          $(element).datepicker({
            changeMonth: true,
            changeYear: true,
            yearRange: '-100y:c+nn',
            maxDate: '+0D',
            dateFormat: 'yy-mm-dd'
          });

        }
      };
    });
}());