angular.module('pixie.dashboard')

.directive('edContextMenuItem', ['contextMenu', 'selectedItem', 'folders', function(contextMenu, selectedItem, folders) {
    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            el.on('contextmenu', function(e) {

                $scope.$apply(function() {

                    if ('edIsRootFolder' in attrs) {
                        selectedItem.set(folders.getByName('root'));
                    } else {
                        selectedItem.set($scope.item || $scope.folder);
                    }
                });

                contextMenu.show(e);
            });
        }
    }
}])

.directive('edMoreOptionsMenu', ['$rootScope', 'contextMenu', 'selectedItem', function($rootScope, contextMenu, selectedItem) {
    return {
        restrict: 'A',
        link: function($scope, el) {
            var open = false,
                menu = $('#context-menu');

            el.on('click', function() {
                if ( ! open || contextMenu.open) {
                    var context = selectedItem.get('type'),
                        rect = el[0].getBoundingClientRect();

                    contextMenu.generateMenu(context);
                    contextMenu.positionMenu({
                        clientX: rect.left,
                        clientY: rect.top + el.height() + 10
                    });

                    open = true;
                    contextMenu.open = false;
                } else {
                    contextMenu.hide();
                    open = false;
                }
            });

            $rootScope.$on('contextmenu.closed', function() {
                open = false;
            });
        }
    }
}])

.directive('edContextMenu', ['$rootScope', 'contextMenu', 'selectedItem', function($rootScope, contextMenu, selectedItem) {
    return {
        restrict: 'A',
        compile: function(el) {
            el.on('click', '.context-menu-item', function(e) {
                e.stopPropagation();
                e.preventDefault();
                selectedItem[e.currentTarget.dataset.action]();
                el.hide();
            });

            el.on('contextmenu', function(e) {
                e.preventDefault();
            });

            //hide custom menu on window resize and update max height
            el.css('max-height', window.innerHeight - 20);
            window.onresize = function() {
                el.hide();
                el.css('max-height', window.innerHeight - 20);
            };

            //hide custom context menu on left click if user didn't click inside the menu itself or on more options button
            $(document).on('click', function(e) {
                var button = e.which || e.button,
                    clickedInsideMenu = $(e.target).closest(el).length || $(e.target).closest('#more-options').length;

                if (button === 1 && !clickedInsideMenu) {
                    $rootScope.$emit('contextmenu.closed');
                }
            });
        }
    }
}])

.factory('contextMenu', ['$rootScope', 'photos', 'utils', 'selectedItem', 'folders', function($rootScope, photos, utils, selectedItem, folders) {

    var items = [
        { name: utils.trans('preview'), icon: 'eye', action: 'preview', context: ['photo', 'folder', 'rootFolder'] },
        { name: utils.trans('openInEditor'), icon: 'edit-alt', action: 'openInEditor', context: ['photo'], separator: true },
        { name: utils.trans('share'), icon: 'share', action: 'share', context: ['photo', 'folder', 'rootFolder'] },
        { name: utils.trans('getLinks'), icon: 'link', action: 'getLinks', context: ['photo', 'folder', 'rootFolder'] },
        { name: utils.trans('moveTo'), icon: 'folder-empty', action: 'move', context: ['photo'] },
        { name: utils.trans('favorite'), icon: 'star', action: 'favorite', context: ['photo'] },
        { name: utils.trans('rename'), icon: 'pencil', action: 'rename', context: ['photo', 'folder'] },
        { name: utils.trans('makeACopy'), icon: 'docs', action: 'copy', context: ['photo'] },
        { name: utils.trans('download'), icon: 'download', action: 'download', context: ['photo', 'folder', 'rootFolder'], separator: true },
        { name: utils.trans('remove'), icon: 'trash', action: 'delete', context: ['photo', 'folder'] },
        { name: utils.trans('restore'), icon: 'ccw', action: 'restore', context: ['trash'] },
        { name: utils.trans('deleteForever'), icon: 'trash', action: 'delete', context: ['trash'] }
    ];

    var contextmenu = {
        open: false,

        show: function(e) {
            var context = utils.stateIs('dashboard.trash') ? 'trash' : selectedItem.get('type');

            if (context === 'folder' && selectedItem.get('name') === 'root') {
                context = 'rootFolder';
            }

            e.preventDefault();
            this.generateMenu(context);
            this.positionMenu(e);

            this.open = true;
        },

        hide: function() {
            $('#context-menu').hide();
            this.open = false;
        },

        generateMenu: function(context) {
            var menu = $('#context-menu');

            menu.find('li').remove();

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item.context.indexOf(context) === -1 || ((item.action == 'preview' || item.action == 'getLinks') && utils.stateIs('view'))) continue;

                //skip move to action if there is only one folder
                if (item.action === 'move' && folders.available.length === 1) continue;

                menu.append('<li class="context-menu-item" data-action="'+item.action+'"><i class="icon icon-'+item.icon+'"></i> '+item.name+'</li>');

                if (item.separator) {
                    menu.append('<li class="separator"></li>');
                }
            }

            menu.show();
        },

        positionMenu: function(e) {
            var menu = $('#context-menu');

            menu.css('display', 'block');

            var menuWidth    = menu.width() + 4,
                menuHeight   = menu.height() + 20,
                windowWidth  = window.innerWidth,
                windowHeight = window.innerHeight,
                clickCoordsX = e.clientX,
                clickCoordsY = e.clientY;

            if ((windowWidth - clickCoordsX) < menuWidth) {
                menu.css('left', windowWidth - menuWidth + 1);
            } else {
                menu.css('left', clickCoordsX + 1);
            }

            if ((windowHeight - clickCoordsY) < menuHeight) {
                menu.css('top', windowHeight - menuHeight + 1);
            } else {
                menu.css('top', clickCoordsY + 1);
            }
        }
    };

    $rootScope.$on('contextmenu.closed', function() {
        contextmenu.hide();
    });

    return contextmenu;
}]);