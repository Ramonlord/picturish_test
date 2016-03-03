'use strict';

angular.module('pixie.dashboard').controller('TrashController', ['$scope', 'photos', function($scope, photos) {

    if (photos.trashed.dirty) {
        photos.getTrashed()
    }

    $scope.$watch('photos.trashed.items', function(newPhotos) {
        if (angular.isArray(newPhotos)) {
            $scope.items = photos.trashed.items;
        }
    });
}]);