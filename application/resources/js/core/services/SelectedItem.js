angular.module('app').factory('selectedItem', ['$rootScope', '$mdDialog', '$http', '$timeout', 'utils', 'photos', 'folders', 'gallery', 'labels', 'deleter', function($rootScope, $mdDialog, $http, $timeout, utils, photos, folders, gallery, labels, deleter) {
    var selectedItem = {

        /**
         * Currently selected item in dashboard (folder or photo)
         */
        item: false,

        /**
         * Get currently selected item or its property.
         *
         * @param {string|undefined} prop
         * @returns {*}
         */
        get: function (prop) {
            if ( ! this.item) {
                this.item = folders.selected;
            }

            if (!prop) return this.item;

            return this.item && this.item[prop];
        },

        /**
         * Set selected item as folder we're currently in
         * so all items and sub-folders are deselected.
         */
        deselect: function() {
            this.item = folders.selected;
        },

        /**
         * Set currently selected item
         *
         * @param {object} item
         * @returns {*}
         */
        set: function (item) {
            return this.item = item;
        },

        /**
         * Open share dialog for folder or file.
         */
        share: function () {
            $mdDialog.show({
                templateUrl: 'assets/views/modals/share.html',
                controller: 'ShareModalController',
                clickOutsideToClose: true,
                locals: {folderName: this.item.name},
                onComplete: function() {
                    var input = $('#share-modal-input')[0];
                    input.setSelectionRange(0, input.value.length);
                }
            });
        },

        /**
         * Restore deleted file or folder from trash.
         */
        restore: function () {
            photos.restore(this.get());
        },

        /**
         * Open currently selected photo in editor.
         */
        openInEditor: function() {
            utils.toState('editor', { id: this.get('id') });
        },

        /**
         * Delete selected photo or album.
         */
        delete: function () {
            deleter.delete(this.get());
        },

        /**
         * Update selected item.
         *
         * @param {object|undefined} payload
         * @return promise
         */
        update: function(payload) {
            var slug = this.get('type') === 'photo' ? 'photos' : 'folders';

            return $http.put($rootScope.baseUrl+slug+'/'+this.get('id'), payload || this.get()).success(function(data) {
                if (selectedItem.get('type') === 'folder') {
                    folders.selected = data;
                } else {
                    selectedItem.set(data);

                    if (angular.isArray(folders.selected.photos)) {
                        for (var i = 0; i < folders.selected.photos.length; i++) {
                            if (folders.selected.photos[i].id == data.id) {
                                folders.selected.photos[i] = data; break;
                            }
                        }
                    }
                }
            });
        },

        /**
         * Open links modal for currently selected file or folder.
         */
        getLinks: function () {
            $mdDialog.show({
                templateUrl: 'assets/views/modals/links.html',
                clickOutsideToClose: true,
                onComplete: function () {
                    $('.link-input').first().focus()[0].select();
                },
                controller: ['$scope', 'selectedItem', 'utils', function ($scope, selectedItem, utils) {
                    $scope.shareable = selectedItem.get();
                    $scope.close = utils.closeModal;
                }]
            });
        },

        /**
         * Copy selected item. Works for photos only currently.
         */
        copy: function() {
            $http.post('photos/'+this.get('id')+'/copy').success(function(data) {
                folders.selected.photos.push(data);
                selectedItem.set(data);
                utils.showToast('PhotoCopySuccess', true);
            }).error(function(data) {
                if(angular.isString(data)) {
                    utils.showToast(data);
                }
            })
        },

        /**
         * Open rename modal for currently open file or folder.
         */
        rename: function () {
            if (this.get('type') === 'folder') {
                folders.openRenameModal(this.get().name);
            } else {
                photos.openRenameModal(this.get().name);
            }
        },

        /**
         * Open modal to move photo to a different folder.
         */
        move: function () {
            $mdDialog.show({
                templateUrl: 'assets/views/modals/move.html',
                controller: ['$scope', 'photos', 'folders', 'selectedItem', function($scope, photos, folders, selectedItem) {
                    $scope.photos = photos;
                    $scope.selectedItem = selectedItem;
                    $scope.folders = folders;
                }]
            });
        },

        /**
         * Start a download for selected photo or folder using iframe hack.
         */
        download: function () {
            var self = this;

            $('#download-iframe').remove();
            $('<iframe id="download-iframe" style="display: none"></iframe>')
                .appendTo('body')
                .attr('src', $rootScope.baseUrl + self.get('type') + '/' + self.get().share_id + '/download')
        },

        /**
         * add currently selected photo to favorites.
         */
        favorite: function () {
            this.addLabel('favorite');
        },

        /**
         * Add given label to currently selected photo.
         *
         * @param {string} name
         */
        addLabel: function(name) {
            labels.addLabel(name, this.get());
        },

        /**
         * Remove given label from currently selected photo.
         *
         * @param {string} name
         */
        removeLabel: function(name) {
            labels.removeLabel(name, this.get());
        },

        /**
         * Open preview gallery for selected item.
         */
        preview: function () {
            var self = this;

            $timeout(function () {
                if (self.get('type') === 'folder') {
                    return folders.preview(self.get('name'));
                }

                gallery.open(self.get());
            });
        }
    };

    /**
     * Deselect any selected files on state change.
     */
    $rootScope.$on('$stateChangeSuccess', function() {
        selectedItem.deselect();
    });

    $rootScope.$on('activity.happened', function(e, action, type, items) {
        if ( ! angular.isArray(items)) items = [items];

        for (var i = 0; i < items.length; i++) {
            if (items[i].id === selectedItem.get('id')) {
                if (action === 'deleted' || action === 'moved') {

                    if (type === 'folder') {
                        folders.open('root');
                    }

                    selectedItem.deselect(); break;
                } else {
                    selectedItem.set(items[i]);
                }
            }
        }
    });

    return selectedItem;
}]);