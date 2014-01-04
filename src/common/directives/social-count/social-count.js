angular.module( 'directives.socialCount', [
    'services.underscore',
    'services.uiQueue',
    'services.tabActivity'
])

.directive( 'socialCount', function(_, tabActivity, uiQueue) {
  return {
    restrict: 'E',
    templateUrl: 'directives/social-count/social-count.tpl.html',
    link: function(scope, element, attributes) {

      var _this = this;

      var url, watch, metric, weight;

      function ensure_attributes() {
        url     = attributes.url;
        metric  = attributes.metric;
        watch   = attributes.watch;
        weight  = attributes.weight;

        if (!url) {
          throw new Error('Expecting url attribute');
        }

        if (!metric) {
          throw new Error('Expecting metric attribute');
        }

        if (!watch) {
          throw new Error('Expecting name of attribute to watch for changes');
        }

        if (_.isUndefined(weight)) {
          throw new Error('Expecting color weight computed');
        }

      }

      // Get displayable metric
      function get_metric(d) {
        var bookmarked = d.bookmarked;
        var current    = d.current;

        return current[metric];

      }

      // Apply color weight
      function apply_color_weight($el, color_weight) {

        function shadeColor(color, percent) {
          var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
          return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
        }

        var w = color_weight > 0.90 ? color_weight - 0.35 : (color_weight < 0.25 ? color_weight + 0.25 : color_weight);

        return $el.css('color', shadeColor('rgb(100, 100, 100)', (1 - w) * 100));
      }

      // Update view
      function update_view(data) {

        if (!data) {
          return;
        }

        // Grab param
        var new_number       = get_metric(data),
            current_number   = +element.text(),
            new_num_greater  = new_number > current_number,
            difference;

        // Constants
        var REGULAR_GREY = '#D5D5D5';

        var HEAVY_GREEN  = 'rgba(7, 126, 7, 1)';
        var LIGHT_GREEN  = 'rgba(7, 126, 7, 0.7)';

        var GREEN_SHADOW = '1px 1px 1px rgb(142, 252, 142)';
        var RED_SHADOW   = '1px 1px 1px rgba(206, 13, 13, 0.2)';

        var HEAVY_RED    = 'rgba(206, 13, 13, 1)';
        var LIGHT_RED    = 'rgba(206, 13, 13, 0.7)';

        // Base checks
        if (!_.isNumber(new_number)) {
          return;
        }

        // Animate updating of number(s)
        function update_number($p, $c) {

          function colorise($el) {

            function get_green_level() {
              if (difference <= 5) {
                return LIGHT_GREEN;
              } else {
                return HEAVY_GREEN;
              }
            }

            function get_red_level() {
              if (difference <= 5) {
                return LIGHT_RED;
              } else {
                return HEAVY_RED;
              }
            }

            var color  = new_num_greater ? get_green_level() : get_red_level();
            var shadow = new_num_greater ? GREEN_SHADOW : RED_SHADOW;
            var background = new_num_greater ? 'activity' : 'inactivity';

            scope.status = background;
            scope.$apply();
            _.delay(function() {
              scope.status = '';
              scope.$apply();
            }, 2000);

            angular.element($el).css({
              'color'       : color,
              'text-shadow' : shadow
            });
            _.delay(function() {
              angular.element($el).css({
                'color'       : '',
                'text-shadow' : ''
              });
            }, 1000);
          }

          function equal(a, b) {
            return angular.element(a).text() === angular.element(b).text();
          }

          difference = new_number - current_number;
          _.each($c, function(v, k) {

            var index = $c.length - 1 - k;
            (function(i, m) {

              _.delay(function() {
                if ($c[i] && $p[i] && !equal($c[i], $p[i])) {
                  angular.element($p[i]).css('opacity', 0.5);
                  angular.element($c[i]).css('opacity', 0);
                  _.delay(function() {
                    angular.element($p[i]).replaceWith($c[i]);
                    angular.element($c[i]).css('opacity', 1);
                    colorise($c[i]);
                  }, 170);
                } else if ($c[i] && !$p[i]) {
                  _.delay(function() {
                    element.prepend($c[i]);
                    colorise($c[i]);
                  }, 170);
                } else if (!$c[i] && $p[i]) {
                  angular.element($p[i]).remove();
                }
              }, 140 * (m + 1));

            })(index, k);

          });
        }

        function bootstrap($p, $c) {

          function fill(a, b) {
            var limit = a.length - b.length;
            for (var i = 0; i < limit; i++) {
              [].unshift.call(b, null);
            }
          }

          if ($c.length > $p.length) {
            fill($c, $p);
          } else if ($p.length > $c.length) {
            fill($p, $c);
          }

        }

        // Grab locals
        var $prev     = element.children();
        var $current  = angular.element(_.map(new_number.toString().split(''), function(o) {
          return '<span class="s-num">' + o + '</span>';
        }).join(''));

        // If there was no value, just populate and return
        if (!$prev.length) {
          // return element.append(apply_color_weight($current, weight));
          return element.append($current);
        }

        // There exists some value...
        bootstrap($prev, $current);

        // Animate updating of the numbers
        update_number($prev, $current);

      }

      // Ensure local vars
      ensure_attributes();

      // Watch

      function watch_all_handler(newValue, oldValue) {
        // Update view
        if (angular.equals(newValue, oldValue)) {
          // Registering watch
          update_view(newValue);
        } else {
          if (!!newValue) {

            if (angular.equals(newValue.current[metric], oldValue.current[metric])) {
              return;
            }

            (function(fn, v) {

              uiQueue.push({
                fn: fn,
                v : angular.copy(v)
              });

            }(update_view, newValue));

          }
        }
      }
      scope.$watch(watch, watch_all_handler, true);

      // scope.$watch(weight, function(newValue, oldValue) {
      //   apply_color_weight(element.children(), newValue);
      // });

    }
  };
})

;

