'use strict';

angular.module('pixie.dashboard').controller('FavoritesController', ['$scope', 'photos', function($scope, photos) {
    if (photos.favorites.dirty) {
        photos.getFavorites();
    }

    $scope.$watch('photos.favorites.items', function(newPhotos) {
        if (angular.isArray(newPhotos)) {
            $scope.items = photos.favorites.items;
        }
    });
}]);