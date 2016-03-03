'use strict';

angular.module('pixie.dashboard')

//make photo draggable
.directive('edFileDraggable', ['selectedItem', function(selectedItem) {
    return {
        link: function($scope, el) {
            el.draggable({
                revert: 'invalid',
                appendTo: 'body',
                helper: function() {
                    document.body.classList.add('dragging');

                    $scope.$apply(function() {
                        selectedItem.set($scope.item);
                    });

                    return '<div id="photo-drag-helper"><i class="icon icon-picture"></i>'+selectedItem.get('name')+'</div>'
                },
                cursorAt: {
                    top: 0,
                    left: -10
                },
                stop: function() {
                    document.body.classList.remove('dragging');
                }
            });

            $scope.$on('$destroy', function() {
                el.off('**');
            });
        }
    };
}])

//move photo into folder when dropped on element
.directive('edFolderDroppable', ['selectedItem', 'photos', function(selectedItem, photos) {
    return {
        link: function($scope, el) {
            el.droppable({
                hoverClass: 'draggable-over',
                drop: function(e) {
                    photos.moveToFolder(selectedItem.get(), e.target.dataset.id);
                },
                tolerance: 'pointer'
            });

            $scope.$on('$destroy', function() {
                el.off('**');
            });
        }
    };
}])

//move photo into when dropped on element
.directive('edTrashDroppable', ['selectedItem', 'photos', function(selectedItem, photos) {
    return {
        link: function($scope, el) {
            el.droppable({
                hoverClass: 'draggable-over',
                drop: function() {
                    photos.delete(selectedItem.get());
                },
                tolerance: 'pointer'
            });

            $scope.$on('$destroy', function() {
                el.off('**');
            });
        }
    };
}]);
