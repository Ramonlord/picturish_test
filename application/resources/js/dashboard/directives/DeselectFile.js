'use strict';

angular.module('pixie.dashboard')

/**
 * Deselect currently selected file if clicked on a node that has .deselect-file class.
 */
.directive('edDeselectFile', ['selectedItem', function(selectedItem) {
    return {
        restrict: 'A',
        link: function($scope) {
            $(document).on('click', '.deselect-file', function(e) {
                if (e.target !== this) return;

                if (selectedItem.get('type') === 'photo') {
                    $scope.$apply(function () {
                        selectedItem.deselect();
                    })
                }
            });
        }
   	}
}]);