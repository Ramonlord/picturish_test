'use strict';

angular.module('pixie.dashboard').controller('PhotosListController', ['$scope', 'photos', 'utils', 'selectedItem', 'deleter', function($scope, photos, utils, selectedItem, deleter) {

    $scope.search = { query: '' };

    $scope.currentPage = 1;

    $scope.selectedItems = [];

    $scope.itemsPerPage = 12;

    $scope.deleteSelectedPhotos = function() {
        deleter.delete($scope.selectedItems);
        $scope.selectedItems = [];
    };

    $scope.isItemSelected = function(item) {
        return $scope.selectedItems.indexOf(item) > -1;
    };

    $scope.select = function(item) {
        var idx = $scope.selectedItems.indexOf(item);
        if (idx > -1) $scope.selectedItems.splice(idx, 1);
        else $scope.selectedItems.push(item);

        selectedItem.set(item);
    };

    $scope.toggleAllPhotos = function() {

        //all items already selected, deselect all
        if ($scope.selectedItems.length === $scope.items.length) {
            $scope.selectedItems = [];
        }

        //all items arent selected, copy all users array to selected items
        else {
            $scope.selectedItems = $scope.items.slice();
        }
    };
}]);