'use strict';

angular.module('app').controller('PhotosController', ['$scope', '$rootScope', 'utils', '$http', '$mdDialog', 'photos', 'deleter', function($scope, $rootScope, utils, $http, $mdDialog, photos, deleter) {
    $scope.photos = photos;
    $scope.allPhotos = [];

    //photos search query
    $scope.search = { query: '' };

    $scope.selectedItems = [];

    $scope.isItemSelected = function(item) {
        return $scope.selectedItems.indexOf(item) > -1;
    };

    $scope.select = function(item) {
        var idx = $scope.selectedItems.indexOf(item);
        if (idx > -1) $scope.selectedItems.splice(idx, 1);
        else $scope.selectedItems.push(item);
    };

    $scope.deletePhotos = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            $scope.selectedItems = [];
            return;
        }

        deleter.delete($scope.selectedItems);

        if ( ! utils.isDemo) {
            $scope.allPhotos = $scope.allPhotos.filter(function(photo) {
                return $scope.selectedItems.indexOf(photo) === -1;
            });
        }

        $scope.selectedItems = [];
    };

    $scope.toggleAllPhotos = function() {

        //all items already selected, deselect all
        if ($scope.selectedItems.length === $scope.allPhotos.length) {
            $scope.selectedItems = [];
        }

        //all items arent selected, copy all photos array to selected items
        else {
            $scope.selectedItems = $scope.allPhotos.slice();
        }
    };

    $scope.showUserModal = function(user, $event) {
        $mdDialog.show({
            template: $('#user-modal').html(),
            targetEvent: $event,
            controller: ['$scope', 'users', function($scope, users) {
                $scope.users = users;

                if (user) {
                    $scope.userModel = angular.copy(user);
                    delete $scope.userModel.password;
                    delete $scope.userModel.id;
                    $scope.type = 'edit';
                } else {
                    $scope.type = 'create';
                }

                $scope.submit = function() {
                    var method = $scope.type === 'create' ? 'register' : 'updateAccountSettings';

                    users[method]($scope.userModel, user.id).error(function(data) {
                        $('.user-modal .errors').html('');

                        for (var field in data) {
                            $('.user-modal .errors').append('<div class="error">'+data[field][0]+'</div>');
                        }
                    }).success(function() {
                        users.closeModal();

                        if ($scope.type === 'create') {
                            $rootScope.showToast('createdUserSuccessfully', true);
                            users.all.push($scope.userModel);
                        } else {
                            $rootScope.showToast('updatedUserSuccessfully', true);

                            for (var i = 0; i < users.all.length; i++) {
                                if (users.all[i].id == user.id) {
                                    users.all[i] = $scope.userModel; break;
                                }
                            }
                        }

                        $scope.userModel = {};
                    })
                };
            }]
        });
    };

    $scope.photosAjaxInProgress = true;

    photos.getAll(true).success(function(data) {
        $scope.allPhotos = data;
    }).finally(function() {
        $scope.photosAjaxInProgress = false;
    })
}]);
