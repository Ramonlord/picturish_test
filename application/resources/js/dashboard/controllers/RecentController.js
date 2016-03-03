'use strict';

angular.module('pixie.dashboard').controller('RecentController', ['$scope', '$http', 'dashboardState', function($scope, $http, dashboardState) {
    $scope.items = [];

    $http.get('photos/recent').success(function(data) {
        $scope.items = data;
        dashboardState.recentLoaded = true;
    })
}]);