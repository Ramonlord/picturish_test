angular.module('app')

.factory('gallery', ['$rootScope', '$translate', function($rootScope, $translate) {
    var gallery = {

        /**
         * Photoswipe gallery object.
         */
        ps: false,

        /**
         * Open gallery with given photos.
         *
         * @param {array} photos
         * @param {int|undefined} index
         */
        open: function(photos, index) {
            if ( ! photos) return;

            if ( ! this.initiated) {
                this.init();
            }

            var items = this.formatSlidesArray(photos);

            var options = {
                index: index || 0,
                closeOnScroll: false,
                history: false,
                shareEl: false
            };

            this.ps = new PhotoSwipe(this.node, PhotoSwipeUI_Default, items, options);
            this.ps.init();
        },

        init: function() {
            this.node = $('.pswp')[0];
        },

        formatSlidesArray: function(slides) {
            var out = [];

            if ( ! angular.isArray(slides)) {
                slides = [slides];
            }

            for (var i = 0; i < slides.length; i++) {
                var slide = slides[i];

                out.push({
                    src: slide.absoluteUrl,
                    w: slide.width,
                    h: slide.height,
                    title: slide.name,
                    name: slide.name
                });
            }

            return out;
        }
    };

    return gallery;
}]);