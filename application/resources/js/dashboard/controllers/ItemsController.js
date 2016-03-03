'use strict';

angular.module('pixie.dashboard').controller('ItemsController', ['$scope', '$filter', 'photos', 'folders', 'localStorage', 'selectedItem', 'rightPanel', function($scope, $filter, photos, folders, localStorage, selectedItem, rightPanel) {
    $scope.photos  = photos;
    $scope.folders = folders;

    $scope.selectedItem = {};

    $scope.order = {
        prop: '-updated_at'
    };

    $scope.changeOrder = function(order) {
        $scope.order.prop = order;
    };

    $scope.openRightPanel = function() {
        rightPanel.open = true;
    };

    $scope.filteredPhotos = [];

    //manually filter selected folders photos so we can get a reference to resulting array
    function sortFiles() {
        if ( ! folders.selected || ! angular.isArray(folders.selected.photos)) return;

        $scope.items = $filter('orderBy')(folders.selected.photos || [], $scope.order.prop);
        $scope.filteredPhotos = $scope.items;
    }

    $scope.$watchCollection('folders.selected.photos', function() {
        sortFiles();
    });

    $scope.$watch('order.prop', function() {
        sortFiles();
    });

    //currently active items layout (grid or list)
    $scope.selectedView = localStorage.get('selectedView', 'grid');

    $scope.toggleSelectedView = function() {
        if ($scope.selectedView === 'list') {
            $scope.selectedView = 'grid';
        } else {
            $scope.selectedView = 'list';
        }

        localStorage.set('selectedView', $scope.selectedView);
    };

    //predicate for filtering photos by folder, if we have a folder selected filter out
    //only photos in that folder, otherwise only photos that have not folder at all
    $scope.selectedFolderFilterPredicate = function() {
        if (folders.selected.id) {
            return {folder_id: folders.selected.id};
        } else {
            return {folder_id: null};
        }
    };

    /**
     * Check if given item is currently selected.
     *
     * @param {object} item
     * @returns {boolean}
     */
    $scope.itemIsSelected = function(item) {
        return selectedItem.get('id') == item.id && selectedItem.get('type') === item.type;
    };

    /**
     * Select given folder or photo.
     *
     * @param {object} item
     */
    $scope.selectItem = function(item) {
        selectedItem.set(item);
    };

    $scope.openEditorWithDesign = function(design) {
        designs.active = design;
        $state.go('editor', { id: design.id });
    };

    $scope.formatTime = function(time) {
        return moment.utc(time).fromNow();
    };
}]);
