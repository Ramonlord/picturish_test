angular.module('app')

.factory('photos', ['$rootScope', '$http', '$mdDialog', 'folders', 'utils', function($rootScope, $http, $mdDialog, folders, utils) {
    var photos = {

        //all photos user has deleted/moved to trash
        trashed: {
            dirty: true,
            items: []
        },

        //all photos user has added to favorites
        favorites: {
            dirty: true,
            items: []
        },

        /**
         * Fetch a photo with given id from server.
         *
         * @param id
         * @returns promise
         */
        get: function(id) {
            return $http.get($rootScope.baseUrl+'photos/'+id);
        },

        /**
         * Fetch all photos from the server.
         *
         * @param {boolean} all
         * @returns promise
         */
        getAll: function(all) {
            return $http.get($rootScope.baseUrl+'photos?all='+all);
        },

        /**
         * Fetch all photos user has moved to trash from the server.
         *
         * @returns promise
         */
        getTrashed: function() {
            return $http.get($rootScope.baseUrl+'user-trash').success(function(data) {
                photos.trashed.items = data;
                photos.trashed.dirty = false;
            });
        },

        /**
         * Fetch all photos user has marked as favorites.
         *
         * @returns promise
         */
        getFavorites: function() {
            return $http.get($rootScope.baseUrl+'labels/favorite').success(function(data) {
                photos.favorites.items = data;
                photos.favorites.dirty = false;
            });
        },

        /**
         * Attach photos with given ids (attach_id) to currently logged in user.
         *
         * @param {array} ids
         * @returns {promise}
         */
        attachToUser: function(ids) {
            return $http.post($rootScope.baseUrl + 'photo/attach-to-user', {ids: ids}).success(function(data) {
                if (data) {
                    utils.showToast(data);
                }
            });
        },

        save: function(photo) {
            return $http.post($rootScope.baseUrl+'photos', photo).success(function(data) {
                folders.selected.photos.push(data);
                $rootScope.$emit('activity.happened', 'created', 'photo', data);
            });
        },

        /**
         * Restore given photo from trash to it's original folder.
         *
         * @param {object} photo
         */
        restore: function(photo) {
            $http.post($rootScope.baseUrl+'trash/restore/'+photo.id).success(function(data) {
                for (var i = 0; i < photos.trashed.items.length; i++) {
                    if (photos.trashed.items[i].id == data.id) {
                        var p = photos.trashed.items[i],
                            folder = folders.getById(p.folder_id);

                        if (folder && angular.isArray(folder.photos)) {
                            folder.photos.push(p);
                        }

                        photos.trashed.items.splice(i, 1);
                        photos.selected = false;
                        utils.showToast('photoRestoreSuccess', true);
                        break;
                    }
                }
            })
        },

        rename: function(id) {
            $http.put($rootScope.baseUrl + 'photos/' + id, { name: this.photoNameModel }).success(function(data) {
                var folder = folders.getById(data.folder_id);

                if ( ! folder || ! folder.photos) {
                    photos.closeModal();
                    $rootScope.$emit('activity.happened', 'renamed', 'photo', data);
                    return utils.showToast('photoRenameSuccess', true);
                } else {
                    for (var i = 0; i < folder.photos.length; i++) {
                        if (folder.photos[i].id == data.id) {
                            folder.photos[i] = data;
                            photos.closeModal();
                            $rootScope.$emit('activity.happened', 'renamed', 'photo', data);
                            return utils.showToast('photoRenameSuccess', true);
                        }
                    }
                }
            })
        },

        /**
         * Move given photo to given folder.
         *
         * @param {object} photo
         * @param {int}   folderId
         */
        moveToFolder: function(photo, folderId) {
            $http.put($rootScope.baseUrl + 'photos/' + photo.id, { folder_id: folderId }).success(function(data) {
                for (var i = 0; i < folders.selected.photos.length; i++) {
                    if (folders.selected.photos[i].id == data.id) {

                        //delete photo from older folder
                        folders.selected.photos.splice(i, 1);
                    }
                }

                //move photo to new folder
                for (var j = 0; j < folders.available.length; j++) {
                    if (folders.available[j].id == folderId) {
                        if (angular.isArray(folders.available[j].photos)) {
                            folders.available[j].photos.push(data);
                        } else {
                            folders.available[j].photos = [data];
                        }

                        photos.selected = false;
                        photos.closeModal();
                        $rootScope.$emit('activity.happened', 'moved', 'photo', data);
                        return utils.showToast('photoMoveSuccess', true);
                    }
                }
            })
        },

        /**
         * Open modal for renaming selected photo.
         *
         * @param {string} name
         */
        openRenameModal: function(name) {
            this.photoNameModel = name;

            $mdDialog.show({
                templateUrl: 'assets/views/modals/renamePhoto.html',
                controller: ['$scope', 'photos', 'selectedItem', function($scope, photos, selectedItem) {
                    $scope.photos = photos;
                    $scope.selectedItem = selectedItem;
                }],
                onComplete: function() {
                    $('#photo-name').focus();
                }
            });
        },

        /**
         * Select a photo by given id.
         *
         * @param {int|string} id
         * @returns {*}
         */
        selectById: function(id) {
            for (var i = 0; i < folders.selected.photos.length; i++) {
                if (folders.selected.photos[i].id == id) {
                    this.selected = folders.selected.photos[i];
                }
            }
        },

        closeModal: function() {
            $mdDialog.hide();
            this.photoNameModel = false;
        },
    };

    return photos;
}]);