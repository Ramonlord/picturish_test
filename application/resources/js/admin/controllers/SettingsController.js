'use strict';

angular.module('pixie.admin').controller('SettingsController', ['$scope', '$http', 'utils', 'users', function($scope, $http, utils, users) {

    $scope.settings = angular.copy(utils.getAllSettings());

    $scope.updateSettings = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            return;
        }

        $http.post('settings', $scope.settings).success(function(data) {
            utils.showToast(data);
        }).error(function(data) {
            utils.showToast(data);
        });
    }
}]);
