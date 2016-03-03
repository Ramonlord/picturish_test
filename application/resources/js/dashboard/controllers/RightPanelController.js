'use strict';

angular.module('pixie.dashboard').value("rightPanel", {
    open: true
})

.controller('RightPanelController', ['$scope', 'activity', 'rightPanel', 'localStorage', 'selectedItem', 'utils', function($scope, activity, rightPanel, localStorage, selectedItem, utils) {
    $scope.activity = activity;

    rightPanel.open = localStorage.get('rightPanelOpen', true);

    //currently active table on right panel
    $scope.activeTab = 'details';

    $scope.rightPanelModel = {};
    $scope.descriptionAjaxInProgress = false;

    $scope.editDescription = function() {
        if (selectedItem.get('name')) {
            selectedItem.update({ description: selectedItem.get('description')}).success(function() {
                utils.showToast('descriptionUpdated', true);
            });
        }
    };

    $scope.activityFolderFilterPredicate = function() {
        if (selectedItem.get('type') === 'folder') {
            return {folder_id: selectedItem.get('id')};
        }
    };

    $scope.activityFileFilterPredicate = function() {
        if (selectedItem.get('type') === 'photo') {
            return { id: selectedItem.get('id') };
        }
    };

    $scope.openTab = function(name) {
        $scope.activeTab = name;
    };

    $scope.toRelativeTime = function(time) {
        return moment.utc(time).fromNow();
    };
}])

.filter('activityRelativeToContext', ['selectedItem', function(selectedItem) {
    return function(input) {

        var out = [];

        for (var i = 0; i < input.length; i++) {
            var activity = input[i];

            if (selectedItem.get('type') === 'photo') {
                if (activityIsRelevantToFile(activity)) {
                    out.push(activity);
                }
            } else if(selectedItem.get('type') === 'folder') {
                if (activityIsRelevantToFolder(activity)) {
                    out.push(activity);
                }
            }
        }

        function activityIsRelevantToFolder(activity) {
            return activity.folder_id == selectedItem.get('id');
        }

        function activityIsRelevantToFile(activity) {
            for (var i = 0; i < activity.items.length; i++) {
                if (activity.items[i].id == selectedItem.get('id')) {
                    return true;
                }
            }
        }

        return out;
    }
}]);