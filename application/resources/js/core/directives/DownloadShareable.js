'use strict';

angular.module('app').directive('edDownloadShareable', ['$state', 'gallery', 'selectedItem', function($state, gallery, selectedItem) {
    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            var downloadIframe = false,
                type = attrs.edDownloadShareable || 'photo', id;

        	el.on('click', function() {

				if ( ! downloadIframe) {
					downloadIframe = $('<iframe style="display: none"></iframe>').appendTo(el);
				}

				//set iframe src to the server side download link

                //user is in the shareable view page
                if ($state.current.name === 'view') {
                    return downloadIframe.attr('src', $scope.baseUrl+$scope.type+'/'+$scope.shareable.share_id+'/download');
                }

                //user is in the dashboard
                downloadIframe.attr('src', $scope.baseUrl+selectedItem.get('type')+'/'+selectedItem.get('share_id')+'/download');
        	});
        }
    };
}]);