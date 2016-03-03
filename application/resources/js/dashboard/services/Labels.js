'use strict';

angular.module('pixie.dashboard').factory('labels', ['$rootScope', '$http', 'photos', 'utils', function($rootScope, $http, photos, utils) {
    return {
        addLabel: function(name, item) {
            var self = this;

            //check if we've already added this label to selected item, if so remove it instead
            if (item['is'+utils.capitalize(name)]) {
                //TODO fix for to work for other labels, works for favorite only now
                return self.removeLabel('favorite', item);
            }

            $http.post($rootScope.baseUrl+'labels/attach', { label:name, photoId: item.id }).success(function(data) {

                //mark labels array (favorites) as dirty so we can refetch
                //it from the server when user opens that labels state
                photos[name+'s'].dirty = true;

                self.addLabelToModel(item, name);
                utils.showToast(data);
            }).error(function(data) {
                utils.showToast(data);
            })
        },

        removeLabel: function(name, item) {
            var self = this;

            $http.post($rootScope.baseUrl+'labels/detach', { label:name, photoId: item.id }).success(function(data) {

                self.removeLabelFromModel(item, name);
                utils.showToast(data);

                for (var i = 0; i < photos.favorites.items.length; i++) {
                    if (photos.favorites.items[i].id == item.id) {
                        photos.favorites.items.splice(i, 1);
                        break;
                    }

                }
            }).error(function(data) {
                utils.showToast(data);
            })
        },

        /**
         * Add given label to given item.
         *
         * @param {object} item
         * @param {string} name
         * @returns {string}
         */
        addLabelToModel: function(item, name) {
            item['is'+utils.capitalize(name)] = true;
        },

        /**
         * Remove given label from given item.
         *
         * @param {object} item
         * @param {string} name
         * @returns {string}
         */
        removeLabelFromModel: function(item, name) {
            item['is'+utils.capitalize(name)] = false;
        }
    }
}]);