angular.module('app')

.factory('folders', ['$rootScope', '$http', '$mdDialog', '$stateParams', '$state', 'gallery', 'utils', 'dashboardState', function($rootScope, $http, $mdDialog, $stateParams, $state, gallery, utils, dashboardState) {
    var folders = {

        //model for renaming/create new folder
        folderNameModel: {},

        //all folders user has created
        available: [],

        //currently selected folder
        selected: false,

        /**
         * Get all folders current user has access to.
         *
         * @returns {Promise}
         */
        getAll: function() {
            return $http.get('folders').success(function(data) {
                folders.available = data;
                folders.bindEvents();
            })
        },

        /**
         * Open folder with given name.
         *
         * @param {string} name
         */
        open: function(name) {
            if (!name) return;
            $state.go('dashboard.albums', { folderName: name });
        },

        /**
         * Create a new folder.
         *
         * @returns {Promise|void}
         */
        createNew: function() {
            if ( ! this.folderNameModel.new) return;

            return $http.post('folders', { name: this.folderNameModel.new }).success(function(data) {
                folders.closeModal();
                utils.showToast('newAlbumCreated', true);
                folders.available.push(data);
                folders.open(data.name);
                $('.folder-name-modal .md-modal-error').html('');
                $rootScope.$emit('activity.happened', 'created', 'folder', data)
            }).error(function(data) {
                $('.folder-name-modal .md-modal-error').html(data);
            })
        },

        /**
         * Return a photo matching given id from selected folder photos.
         *
         * @param   {string|int} id
         * @returns {*}
         */
        getPhotoById: function(id, folderId) {
            if ((! this.selected || ! this.selected.photos) && ! folderId) return;

            id = parseInt(id);

            for (var i = 0; i < this.selected.photos.length; i++) {
                if (this.selected.photos[i].id === id) {
                    return this.selected.photos[i];
                }
            }
        },

        /**
         * Rename folder matching given name.
         *
         * @param {string} name
         */
        rename: function(name) {
            var folder  = this.getByName(name),
                payload = { name: this.folderNameModel.new };

            if (folder && folder.name !== 'root') {
                $http.put($rootScope.baseUrl+'folders/'+folder.id, payload).success(function(data) {
                    utils.showToast('folderRenameSuccess', true);
                    folders.closeModal();

                    for (var i = 0; i < folders.available.length; i++) {
                        if (data.id === folders.available[i].id) {
                            folders.available[i] = data;
                            $rootScope.$emit('activity.happened', 'renamed', 'folder', data);
                            break;
                        }
                    }
                })
            }
        },

        /**
         * Open modal for sharing selected folder.
         *
         * @param {object} $event
         */
        openShareModal: function($event) {
            $mdDialog.show({
                template: $('#share-modal').html(),
                targetEvent: $event,
                controller: 'ShareModalController'
            });
        },

        /**
         * Open modal for creating a new folder.
         *
         * @param {object} $event
         */
        openNewModal: function($event) {
            $mdDialog.show({
                template: $('#new-folder-name-modal').html(),
                clickOutsideToClose: true,
                targetEvent: $event,
                controller: ['$scope', 'folders', function($scope, folders) {
                    $scope.folders = folders;
                    $scope.create = true;
                }],
                onComplete: function() {
                    $('#folder-name').focus();
                }
            });
        },

        /**
         * Open modal for renaming a folder.
         *
         * @param {string} name
         * @param {object} $event
         */
        openRenameModal: function(name) {
            this.folderNameModel.new = name;
            this.folderNameModel.old = name;

            $mdDialog.show({
                template: $('#new-folder-name-modal').html(),
                clickOutsideToClose: true,
                controller: ['$scope', 'folders', function($scope, folders) {
                    $scope.folders = folders;
                    $scope.rename = true;
                }],
                onComplete: function() {
                    $('#folder-name').focus();
                }
            });
        },

        closeModal: function() {
            folders.folderNameModel = {};
            $mdDialog.hide();
        },

        /**
         * Return whether or not we have any folders open
         * and if we are in folders state.
         *
         * @returns {*|boolean}
         */
        anyOpen: function() {
            return (this.selected && this.selected.name && this.selected.name !== 'root') || $state.current.name.indexOf('albums') === -1;
        },

        /**
         * Open initial folder based on state params and bind to state change event.
         */
        bindEvents: function() {
            if (this.eventsBound) return;

            var unbind = $rootScope.$on('folders.fetchedPhotos', function() {
                dashboardState.loaded = true;
                unbind();
            });

            this.selectByName($stateParams.folderName || 'root');

            $rootScope.$on('$stateChangeStart', function(e, toState, params) {
                if (toState.name.indexOf('albums') > -1) {
                    folders.selectByName(params.folderName || 'root');
                    folders.getPhotosFor(params.folderName);
                }
            });

            this.eventsBound = true;
        },

        /**
         * Open preview gallery with given folders photos (if it's not empty)
         *
         * @param {string} name
         * @returns {void}
         */
        preview: function(name) {
            var folder = this.getByName(name);

            //if we haven't fetched photos yet for this folder do it now
            if ( ! angular.isArray(folder.photos)) {
                this.getPhotosFor(folder).success(function() {
                    folder = folders.getByName(name);

                    if (! folder.photos.length) {
                        return utils.showToast('nothingToPreview', true);
                    }

                    gallery.open(folder.photos);
                })
            } else {
                if (! folder.photos.length) {
                    return utils.showToast('nothingToPreview', true);
                }

                gallery.open(folder.photos);
            }
        },

        /**
         * Get total size of selected folder (human readable string)
         * @returns {*}
         */
        getTotalSize: function() {
            if ( ! this.selected || ! this.selected.photos || ! this.selected.photos.length) return 0;

            var total = 0;

            for (var i = 0; i < this.selected.photos.length; i++) {
                total += parseInt(this.selected.photos[i].file_size);
            }

            return utils.formatFileSize(total);
        },

        /**
         * Fetch photos from server for folder with given name.
         *
         * @param {object|string|int} folder
         */
        getPhotosFor: function(folder) {
            folder = !angular.isObject(folder) ? this.getById(folder) : folder;

            if ( ! folder || (folder.photos && angular.isArray(folders.photos))) return;

            if (folder && ! folder.photos) {
                $rootScope.ajaxProgress.files = true;

                return $http.get($rootScope.baseUrl+'folders/'+folder.id).success(function(data) {
                    for (var i = 0; i < folders.available.length; i++) {
                        if (folder.id === folders.available[i].id) {
                            folders.available[i] = data;
                            folders.selected = folders.available[i];
                            $rootScope.$emit('folders.fetchedPhotos', folder);
                        }
                    }
                }).finally(function() {
                    $rootScope.ajaxProgress.files = false;
                })
            }
        },

        /**
         * Get a folder matching given name.
         *
         * @param name
         * @returns {object|void}
         */
        getByName: function(name) {
            if ( ! name) return;

            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].name === name) {
                    return this.available[i];
                }
            }
        },

        /**
         * Get a folder matching given id.
         *
         * @param id
         * @returns {object|void}
         */
        getById: function(id) {
            if ( ! id) return;

            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].id === id) {
                    return this.available[i];
                }
            }
        },

        /**
         * Select folder with given name as active.
         *
         * @param name
         * @returns {Object|void}
         */
        selectByName: function(name) {
            this.selected = this.getByName(name) || this.getByName('root');
            this.getPhotosFor(this.selected);
            $rootScope.$emit('folders.selected.changed');
        }
    };

    $rootScope.$on('$stateChangeStart', function() {
        folders.selectByName('root');
    });

    return folders;
}]);