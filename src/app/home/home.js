/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'leafy.home', [
  'ui.state',
  'directives.navbar',
  'services.leafy',
  'services.underscore',
  'services.leafySocket',
  'services.leafyState',
  'services.uiQueue',
  'services.socialCountPoller',
  'leafy.bookmark'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})



/**
 * Directive
 */
.directive('activateTooltip', function() {

  return function(scope, element, attrs) {

    $(element).tooltip({
      placement: attrs["tooltipPlacement"]
    });
  };

})

.directive('activateTimerTooltip', function(_) {

  return function(scope, element, attrs) {
    var current = attrs['start'];
    var metric  = attrs['metric'];
    scope.$watch(attrs["notifier"], function(newValue, oldValue) {
      if (!newValue) {
        return;
      }
      if (!oldValue) {
        return;
      }
      current = newValue;
      switch(true) {
        case (current === 1):
          $(element)
          .removeClass('up problem')
          .addClass('down');
          break;
        // case (current < 270):
        //   $(element)
        //   .removeClass('up down')
        //   .addClass('problem');
        //   break;
      }
      $(element).tooltip('show');
      $(element).css('opacity', 1);
      _.delay(function() {
        $(element).tooltip('hide');
        $(element).css('opacity', 0.4);
      }, 2000);
    });

    $(element).tooltip({
      placement: attrs["tooltipPlacement"],
      title: function() {
        return current + ' ' + metric;
      }
    });
  };

})

/**
 * And of course we define a controller for our route.
 */
.controller( 'HomeCtrl', function HomeController( $scope, Leafy, _, SocialCountPoller, leafySocket, uiQueue, leafyState) {

  // Utilities
  function determine_to_flash_update(updates_count) {

    if ($scope.if_flashing_update && updates_count === $scope.updates_count) {
      return;
    }

    if (!!updates_count) {
      $scope.if_flashing_update = true;
      $scope.updates_count      = updates_count;
    }
  }

  // Init
  var current_user, is_polling;
  // var socket = leafySocket.get();

  // Show tooltips
  // $('.twtr').tooltip({
  //   placement: 'right'
  // });
  // $('.fb').tooltip({
  //   placement: 'right'
  // });

  // Register with ui queue
  // $scope.if_flashing_update = false;
  // uiQueue.register(determine_to_flash_update);
  // $scope.flush = function() {
  //   $scope.if_flashing_update = false;
  //   $scope.updates_count      = null;
  //   uiQueue.flush();
  // };

  // Grab user, then show bookmarks
  Leafy
  .User
  .getCurrent()
  .then(grab_user_bookmarks);

  // Receive social data updates
  function process_polling_result(resp) {
    console.log('Polling finished. Updating...');

    is_polling = false;

    var fb_data   = resp.data.fb;
    var twtr_data = resp.data.twtr;

    _.each($scope.user_bookmarks, function(ub, index) {
      if (ub.facebook) {
        ub.facebook.current = fb_data[index];
      }
      if (ub.twitter) {
        ub.twitter.current  = twtr_data[index];
      }
    });

    $scope.$apply();
  }

  function grab_user_bookmarks(user) {

    function show_user_bookmarks(user_bookmarks) {

      function poll() {
        if (is_polling) {
          return;
        }
        socket.once('poll:finish', process_polling_result);
        is_polling = true;
        console.log('Polling start.');
        socket.emit('poll:start', {
          'types'      : ['facebook', 'twitter'],
          'bookmarks'  : $scope.user_bookmarks,
          'user'       : current_user
        });
      }

      // Apply color weight based on count
      function generate_color_weights_by_sc(target_collection) {

        var metrics_to_watch ={
          'facebook': 'share_count',
          'twitter' : 'count'
        };

        var scs = {};
        function return_metric_value(o) {
          return o.current[metrics_to_watch[i]];
        }
        for (var i in metrics_to_watch) {
          scs[i] = _.chain(target_collection)
                    .pluck(i)
                    .map(return_metric_value)
                    .value()
                    .slice(0);
        }

        var s = {};
        for (var k in scs) {
          s[k] = {};
          s[k]['min']   = _.min(scs[k]);
          s[k]['total'] = _.max(scs[k]) - _.min(scs[k]);
        }

         _.each(target_collection, function(v, key, index) {
          for (var j in metrics_to_watch) {
            var t = metrics_to_watch[j];
            v[j + '_color_weight'] = (v[j].current[t] - s[j]['min']) / s[j]['total'];
          }
        });
      }

      // One-time compute color weights
      // generate_color_weights_by_sc(user_bookmarks);

      // Show
      $scope.user_bookmarks = _.sortBy(user_bookmarks, function(o) {
        return o.createdAt;
      }).reverse();

      // $scope.$watch('user_bookmarks.length', function() {
      //   generate_color_weights_by_sc($scope.user_bookmarks);
      // }, true);

    }

    // Track
    current_user = user;
    // Grab user bookmarks
    current_user
    .getBookmarks()
    .then(show_user_bookmarks);

  }

})

;

