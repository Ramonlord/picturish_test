'use strict';

angular.module('app')

.directive('edShareableLinks', ['$compile', 'linkGenerator', 'utils', function($compile, linkGenerator, utils) {
    return {
        restrict: 'E',
        template: '<div class="links-container"></div>',
        replace: true,
        link: function($scope, el, attrs) {

            //if we already have a shareable, generate links now
            if ($scope.shareable) {
                init($scope.shareable);

            //otherwise we might need to wait for ajax request, so we'll generate the links on event
            } else {
                $scope.$on('shareable.ready', function(e, shareable) {
                    init(shareable);
                });
            }

            function init(shareable) {

                //on input click select everything inside the input
                $(document).on('click', '.link-input', function() {
                    this.select();
                });

                generateLinks(shareable);

                if (attrs.edGenerateNav) {
                    generateNav(shareable);
                }

                $scope.$watch('shareable', function(newShareable, oldShareable) {
                    if (newShareable && newShareable !== oldShareable) {
                        generateNav(newShareable);
                        generateLinks(newShareable);
                    }
                })
            }

            //generate and append links html
            function generateLinks(shareable) {
                var links = linkGenerator.getLinksFor(shareable),
                    html  = '<div class="shareable-links">';

                $('.shareable-links').remove();

                for (var i = 0; i < links.length; i++) {
                    var name = links[i];
                    var link = linkGenerator[name](shareable);
                    html += '<label class="link-label">'+utils.trans(name)+'</label><input value="'+link+'" class="link-input" readonly/>';
                }

                html += '</div>';

                el.prepend(html);
            }

            //generate link size selector
            function generateNav(shareable) {
                $('.link-sizes-nav').remove();

                if (shareable.type !== 'photo' || shareable.extension === 'gif') return;

                var nav = '<ul class="link-sizes-nav">';

                $.each(linkGenerator.linkSizes, function(name, method) {
                    if (name === 'original') {
                        nav += '<li class="active" data-name="'+method+'">'+utils.trans(name)+'</li>';
                    } else {
                        nav += '<li data-name="'+method+'">'+utils.trans(name)+'</li>';
                    }
                });

                nav += '</ul>';

                el.append(nav);

                //generate links for clicked size
                el.off('click').on('click', '.link-sizes-nav > li', function(e) {
                    linkGenerator.activeSize = e.target.dataset.name;
                    generateLinks(shareable);
                    el.find('.active').removeClass('active');
                    $(e.target).addClass('active');
                });
            }
        }
    }
}]);