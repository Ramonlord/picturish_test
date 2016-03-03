'use strict';

angular.module('pixie.dashboard').controller('DashboardController', ['$scope', '$state', '$mdDialog', 'gallery', 'rightPanel', 'utils', 'selectedItem', 'folders', 'localStorage', 'photos', 'dashboardState', 'activity', function($scope, $state, $mdDialog, gallery, rightPanel, utils, selectedItem, folders, localStorage, photos, dashboardState, activity) {
    $scope.$state  = $state;
    $scope.gallery = gallery;
    $scope.rightPanel = rightPanel;
    $scope.selectedItem = selectedItem;
    $scope.folders = folders;

    $scope.ad1 = utils.trustHtml(utils.getSetting('ad_dashboard_slot_1'));
    $scope.ad2 = utils.trustHtml(utils.getSetting('ad_dashboard_slot_2'));
    $scope.ad3 = utils.trustHtml(utils.getSetting('ad_dashboard_slot_3'));

    //whether or not dashboard is fully loaded (angular, views, folders, photos etc)
    $scope.dashboardState = dashboardState;

    $scope.openNewImageModal = function($event) {
        $mdDialog.show({
            template: $('#new-image-modal-template').html(),
            targetEvent: $event,
            controller: 'DashboardController'
        });
    };

    //if user has uploaded any photos while logged out
    //or not registered attach them to his account now
    var ids = localStorage.get('attachIds');

    if (ids) {
        photos.attachToUser(ids).success(function() {
            localStorage.remove('attachIds');
            folders.getAll(); activity.getAll();
        });
    } else {
        if ( ! folders.available.length) {
            folders.getAll(); activity.getAll();
        }
    }
}])

.value('dashboardState', { loaded: false });
