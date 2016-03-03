'use strict';

angular.module('pixie.dashboard').controller('NavbarController', ['$rootScope', '$scope', '$http', 'utils', 'linkGenerator', 'selectedItem', function($rootScope, $scope, $http, utils, linkGenerator, selectedItem) {

    $scope.selectedItem = false;

    $scope.getSearchResults = function(query) {
        return $http.get('search/'+query).then(function(response) {
            $scope.searchResults = response.data;
            return response.data;
        });
    };

    $scope.goToSearchPage = function() {
        if ( ! $scope.searchText) return;

        utils.toState('dashboard.search', { query: $scope.searchText });
    };

    $scope.selectItem = function() {
        if ( ! $scope.selectedItem) return;

        $rootScope.shareable = $scope.selectedItem;
        utils.toState('view', { type: $scope.selectedItem.type, id: $scope.selectedItem.share_id, name: $scope.selectedItem.name });
        $scope.searchText = '';
        $scope.selectedItem = false;
    };
}]);