'use strict';

angular.module('app').controller('ViewController', ['$rootScope', '$scope', '$stateParams', '$http', 'utils', 'photos', 'gallery', 'users', 'selectedItem', function($rootScope, $scope, $stateParams, $http, utils, photos, gallery, users, selectedItem) {
    $scope.passContainerVisible = false;

    //close button at the end of navbar, only visible
    //when we opened the preview from dashboard
    $scope.closeButtonVisible = false;

    //ads html trusted by angular
    $scope.ad1 = utils.trustHtml(utils.getSetting('ad_preview_slot_1'));
    $scope.ad2 = utils.trustHtml(utils.getSetting('ad_preview_slot_2'));

    //if we already have a shareable on rootScope preview that
    if ($rootScope.shareable && users.current) {
        assignShareable($rootScope.shareable);
        $scope.closeButtonVisible = true;

    //otherwise fetch shareable from server based on state params
    } else {
        $http.post('shareable/preview', $stateParams).success(function(data) {
            assignShareable(data);
        }).error(function() {
            if (users.current) {
                utils.toState('dashboard.albums');
            } else {
                utils.toState('home');
            }
        });
    }

    function assignShareable(shareable) {
        $scope.shareable = shareable;
        $scope.type = shareable.file_size ? 'photo' : 'folder';

        //ask for password if it's not currently logged in users file and it's password protected
        if (shareable.password && (! users.current || users.current.id != shareable.user_id)) {
            $scope.passContainerVisible = true;
        }

        selectedItem.set(shareable);
        $scope.$broadcast('shareable.ready', shareable);
    }

    $scope.toDashboard = function() {
        utils.toState('dashboard.albums');
    };

    $scope.goHome = function() {
        utils.toState('home');
    };

    $scope.openGallery = function(photos, index) {
        if ( ! angular.isArray(photos)) photos = [photos];

        gallery.open(photos, index || 0, true);
    };

    $scope.isFolder = function() {
        return $scope.shareable && angular.isArray($scope.shareable.photos);
    };

    $scope.checkPassword = function() {
        var payload = {
            id: $scope.shareable.id,
            type: $scope.type,
            password: $scope.password
        };

        $http.post('shareable-password/check', payload).success(function() {
            $scope.passContainerVisible = false;
        }).error(function(data) {
            $scope.error = data;
        })
    };

    $scope.$on('$destroy', function() {
        $rootScope.shareable = false;
        selectedItem.set({});
    });
}]);