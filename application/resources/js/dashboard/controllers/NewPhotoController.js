'use strict';

angular.module('pixie.dashboard').controller('NewPhotoController', ['$rootScope', '$scope', 'photos', 'folders', 'utils', function($rootScope, $scope, photos, folders, utils) {
    $scope.photos = photos;

    $scope.customDimensions = {
        width: 800,
        height: 800,
        name: 'Untitled Photo'
    };

    $scope.selectedPreset = utils.trans('socialMedia');

    $scope.presets = [
        { name: utils.trans('socialMedia'), url: 'social-media.png', size: { width: 800, height: 800, format: 'px' }},
        { name: utils.trans('presentation'), url: 'presentation.png', size: { width: 1024, height: 768, format: 'px' }},
        { name: utils.trans('facebookCover'), url: 'facebook-cover.jpg', size: { width: 851, height: 315, format: 'px' }},
        { name: utils.trans('facebookPost'), url: 'facebook-post.png', size: { width: 940, height: 788, format: 'px' }},
        { name: utils.trans('twitterPost'), url: 'twitter-post.png', size: { width: 1024, height: 512, format: 'px' }},
        { name: utils.trans('instagramPost'), url: 'instagram-post.png', size: { width: 640, height: 640, format: 'px' }}
    ];

    $scope.applyPreset = function(presetName) {
        for (var i = 0; i < $scope.presets.length; i++) {
            var preset = $scope.presets[i];

            if (preset.name === presetName) {
                $scope.customDimensions.width = preset.size.width;
                $scope.customDimensions.height = preset.size.height;
            }
        }
    };

    $scope.openEditorWithCustomDimensions = function() {
        if ( ! $scope.customDimensions) return;

        photos.save({
            name: $scope.customDimensions.name,
            folder_id: folders.selected.id,
            width: $scope.customDimensions.width,
            height: $scope.customDimensions.height
        }).success(function(data) {
            utils.toState('editor', { id: data.id });
            utils.closeModal();
        }).error(function(data) {
            if (angular.isString(data)) {
                utils.showToast(data);
                utils.closeModal();
            }
        })
    };
}]);