'use strict';

angular.module('app')

.directive('spaceUsage', ['$rootScope', '$http', 'users', 'utils', function($rootScope, $http, users, utils) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="space-usage">'+
                    '<div class="progress">'+
                        '<div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>'+
                    '</div>'+
                    '<div class="text"><span class="space-used"></span> {{:: "of" | translate }} <span class="space-avail"></span> {{:: "used" | translate }}</div>'+
                   '</div>',
        scope: {},
        link: function($scope, el) {
            fetchUserSpaceUsage().success(function(data) {
                updateSpaceUsage(el, data);
                el.show();
            });

            var unbind = $rootScope.$on('activity.happened', function() {
                fetchUserSpaceUsage().success(function(data) {
                    updateSpaceUsage(el, data);
                });
            });

            var unbind2 = $rootScope.$on('photos.permaDeleted', function() {
                fetchUserSpaceUsage().success(function(data) {
                    updateSpaceUsage(el, data);
                });
            });

            $scope.$on('$destroy', function() {
                unbind(); unbind2();
            })
        }
    };

    function fetchUserSpaceUsage() {
        return $http.get('users/space-usage');
    }

    function updateSpaceUsage(el, currentUsage) {
        var percentage = (currentUsage / utils.getSetting('maxUserSpace') * 100);
        var spaceUsed = utils.formatFileSize(currentUsage);
        var spaceAvail = utils.formatFileSize(utils.getSetting('maxUserSpace'));

        el.find('.progress-bar').css('width', percentage+'%');
        el.find('.space-used').text(spaceUsed);
        el.find('.space-avail').text(spaceAvail);

        if (percentage >= 100) {
            el.find('.progress-bar').css('background-color', '#B71C1C');
        }
    }
}]);