'use strict';

angular.module('pixie.dashboard').controller('ShareModalController', ['$scope', '$rootScope', '$translate', '$mdDialog', '$http', 'photos', 'selectedItem', 'utils', function($scope, $rootScope, $translate, $mdDialog, $http, photos, selectedItem, utils) {

    $scope.passwordContainerVisible = false;
    $scope.password = { value: '' };

    //folder or file that is being shared
    $scope.shareable = selectedItem.get();

    //shareable type - folder or file
    $scope.rawType = selectedItem.get('type');

    //public link to view the shareable
    $scope.link = $rootScope.baseUrl+( ! utils.getSetting('enablePushState') ? '#/' : '')+'view/'+$scope.rawType+'/'+$scope.shareable.share_id + '/' + $scope.shareable.name;

    //translate type after we've used in to construct url
    $scope.type = $translate.instant($scope.rawType == 'photo' ? 'photo' : 'album');

    $scope.addPassword = function() {
        if ( ! $scope.password.value) return;

        var payload = { id: $scope.shareable.id, type: $scope.type, password: $scope.password.value };

        $http.post($rootScope.baseUrl+'shareable-password/add', payload).success(function(data) {
            $scope.shareable.password = true;
            $scope.closePasswordContainer();
            $rootScope.showToast(data);
        })
    };

    $scope.removePassword = function() {
        var payload = { id: $scope.shareable.id, type: $scope.type };

        $http.post($rootScope.baseUrl+'shareable-password/remove', payload).success(function(data) {
            $scope.shareable.password.value = false;
            $rootScope.showToast(data);
        });
    };

    $scope.togglePasswordContainer = function() {
        $scope.passwordContainerVisible = !$scope.passwordContainerVisible;
    };

    $scope.closePasswordContainer = function() {
        $scope.passwordContainerVisible = false;
        $scope.password = '';
    };

    $scope.closeModal = function() {
        $mdDialog.hide();
    };
}]);
