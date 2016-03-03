'use strict';

angular.module('pixie.dashboard').factory('deleter', ['$rootScope', '$http', 'utils', 'photos', 'folders', function($rootScope, $http, utils, photos, folders) {

    function deletePhotos(photosToDelete) {
        if ( ! photosToDelete.length) return;

        $rootScope.ajaxProgress.files = true;

        //if we are in trash state we will need to delete photos permanently
        if (utils.stateIs(['dashboard.trash', 'admin.photos'])) {
            permaDeleteItems(photosToDelete).success(function() {
                photos.trashed.items = photos.trashed.items.filter(function(photo) {
                    return photosToDelete.indexOf(photo) === -1;
                });

                $rootScope.$emit('photos.permaDeleted');
            }).finally(function() {
                $rootScope.ajaxProgress.files = false;
            });
        }

        //otherwise we will move photos to trash
        else {
            moveItemsToTrash(photosToDelete);
        }

        $rootScope.$emit('activity.happened', 'deleted', 'photo', photosToDelete);
    }

    /**
     * Permanently delete passed in photos and albums.
     *
     * @param {array} items
     * @returns {promise|undefined}
     */
    function permaDeleteItems(items) {
        if ( ! items.length) return;

        return $http.post('delete-items', { items: items }).success(function(data) {
            utils.showToast(utils.trans('permaDeletedItems', {number:data}));
        }).error(function(data) {
            utils.showToast(data);
        })
    }

    /**
     * Move given items to trash.
     *
     * @param {array} items
     * @returns {promise}
     */
    function moveItemsToTrash(items) {
        var ids = [];

        for (var i = 0; i < items.length; i++) {
            ids.push(parseInt(items[i].id));
        }

        return $http.post('trash/put', { ids: ids }).success(function(data) {
            utils.showToast(utils.trans('movedToTrash', {number:data}));
            photos.trashed.dirty = true;

            //if we've moved photos to trash from albums state we
            //can go ahead and remove deleted photos from selected album
            if (utils.stateIs(['dashboard.albums', 'dashboard.albumsRoot'])) {
                folders.selected.photos = folders.selected.photos.filter(function(photo) {
                    return items.indexOf(photo) === -1;
                });
            }
        }).finally(function() {
            $rootScope.ajaxProgress.files = false;
        })
    }

    /**
     * Perma delete given folders and associated photos.
     *
     * @param {array} foldersToDelete
     */
    function deleteFolders(foldersToDelete) {
        if ( ! foldersToDelete.length) return;

        permaDeleteItems(foldersToDelete).success(function() {
            $rootScope.$emit('activity.happened', 'deleted', 'folder', foldersToDelete);

            folders.available = folders.available.filter(function(folder) {
                return foldersToDelete.indexOf(folder) === -1;
            });
        });

        $rootScope.$emit('activity.happened', 'deleted', 'folder', foldersToDelete);
    }

    /**
     * Delete or move to trash given items based on current state and their type.
     *
     * @param {array} items
     */
    function destroy(items) {
        var folders = []; var photos = [];

        //filters items into folders and photos array based on their type
        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.type === 'folder') {
                folders.push(item);
            } else {
                photos.push(item);
            }
        }

        deleteFolders(folders);
        deletePhotos(photos);

        //if photo or folder was delete from preview page go back to dashboard
        if (utils.stateIs('view')) {
            utils.toState('dashboard.albums');
        }
    }

    /**
     * Get options for creating delete conformation modal based on active state.
     *
     * @param {array} items
     * @returns {object|undefined}
     */
    function getConfirmOptions(items) {
        if (utils.stateIs('dashboard.trash')) {
            return {
                title: 'deleteForever',
                content: 'confirmPermaDelete',
                subcontent: 'permaDeleteWarning',
                ok: 'delete',
                onConfirm: function () {
                    destroy(items);
                }
            }
        } else if (utils.stateIs('dashboard.search')) {
            return {
                title: 'deleteItems',
                content: 'sureWantToDeleteItems',
                ok: 'delete',
                onConfirm: function() {
                    destroy(items);
                }
            }
        } else if (items[0].type === 'folder') {
            return {
                title: 'deleteForever',
                content: 'permaDeleteAlbumWarning',
                subcontent: 'permaDeleteWarning',
                ok: 'delete',
                onConfirm: function () {
                    destroy(items);
                }
            }
        }
    }

    return {
        delete: function(items) {
            if ( ! items) return;

            //always make sure we're working with an array
            if (! angular.isArray(items)) items = [items];

            var options = getConfirmOptions(items);

            //if we've got confirm options means we will need
            //to confirm the deletion, otherwise we will just
            //go ahead and delete passed it items without confirming
            if (options) {
                utils.confirm(options);
            } else {
                destroy(items);
            }
        }
    };
}]);