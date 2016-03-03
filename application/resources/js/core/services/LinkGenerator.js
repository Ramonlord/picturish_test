
angular.module('app')

.factory('linkGenerator', ['utils', function(utils) {
    return {

        /**
         * Size that links will be generated for. Method name on shareable object.
         */
        activeSize: 'absoluteUrl',

        /**
         * Available sizes for links. name - method on shareable object.
         */
        linkSizes: {
            original: 'absoluteUrl',
            smallThumbnail: 'smallThumbnail',
            mediumThumbnail: 'mediumThumbnail',
            largeThumbnail: 'largeThumbnail'
        },

        /**
         * Get links for shareable based on it's type.
         *
         * @param {object} shareable
         * @returns {array}
         */
        getLinksFor: function(shareable) {

            if (shareable.type === 'photo') {
                return ['linkToPhoto', 'directLink', 'downloadLink', 'htmlEmbedCode', 'forumEmbedCode'];
            } else {
                return ['linkToAlbum', 'downloadLink'];
            }
        },

        /**
         * Return html embed code for photo.
         *
         * @param {object} photo
         * @returns {string}
         */
        htmlEmbedCode: function(photo) {
            return this.encode('<a href="'+this.linkToPhoto(photo)+'" target="_blank"><img src="'+this.directLink(photo)+'" alt="'+photo.name+'" /></a>');
        },

        /**
         * Return html embed code for photo.
         *
         * @param {object} photo
         * @returns {string}
         */
        forumEmbedCode: function(photo) {
            return this.encode('[URL='+this.linkToPhoto(photo)+'][IMG]'+this.directLink(photo)+'[/IMG][/URL]');
        },

        /**
         * Generate link to either album or folder preview.
         *
         * @param {object} shareable
         * @returns {string}
         */
        linkToShareable: function(shareable) {
            if (shareable.type === 'photo') {
                return this.linkToPhoto(shareable);
            } else {
                return this.linkToAlbum(shareable);
            }
        },

        /**
         * Generate a link to shareable view page.
         *
         * @param {object} photo
         * @returns {string}
         */
        linkToPhoto: function(photo) {
            return utils.baseUrl()+( ! utils.getSetting('enablePushState') ? '#/' : '')+'view/photo/'+photo.share_id+'/'+photo.name;
        },

        /**
         * Generate a link to album view page.
         *
         * @param {object} album
         * @returns {string}
         */
        linkToAlbum: function(album) {
            return utils.baseUrl()+( ! utils.getSetting('enablePushState') ? '#/' : '')+'/view/folder/'+album.share_id+'/'+album.name;
        },

        /**
         * Generate a direct link to shareable.
         *
         * @param {object} shareable
         * @returns {string}
         */
        directLink: function(shareable) {
            return shareable[this.activeSize];
        },

        /**
         * Generate a download link to shareable.
         *
         * @param {object} shareable
         * @returns {string}
         */
        downloadLink: function(shareable) {
            return utils.baseUrl()+shareable.type+'/'+shareable.share_id+'/download';
        },

        /**
         * Encode html so it can be used as input value.
         *
         * @param {string} str
         * @returns {string}
         */
        encode: function(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
    }
}]);