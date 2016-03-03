angular.module('app').controller('HomeController', ['$scope', '$state', 'utils', 'linkGenerator', function($scope, $state, utils, linkGenerator) {
    $scope.ad1 = utils.trustHtml(utils.getSetting('ad_home_slot_1'));
    $scope.links = linkGenerator;

    $scope.shareable = {};

    $scope.linkSelectModel = {
        type: 'directLink',
        size: 'absoluteUrl'
    };

    $scope.assignShareable = function(item) {
        $scope.shareable = item;
    }
}]);