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
angular.module( 'leafy.bookmark', [
  'ui.state',
  'directives.navbar',
  'directives.socialCount',
  'services.leafy',
  'services.socialCountPoller',
  'services.underscore'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'BookmarkCtrl', function HomeController( $scope, Leafy, _, $q, SocialCountPoller) {

  // Init
  var current_user, user_bookmarks;
  $scope.status = '';

  Leafy
  .User
  .getCurrent()
  .then(function(user) {
    current_user = user;
  });

  // Utilities

  function get_user_bookmark_by_id(id) {
    if (!user_bookmarks) {
      user_bookmarks = _.object(_.pluck($scope.user_bookmarks, 'id'), $scope.user_bookmarks);
    }
    return user_bookmarks[id];
  }

  _.extend($scope, {

    destroy: function(index) {
      var user_bookmark_to_be_deleted = $scope.user_bookmark;

      Leafy
      .User
      .getCurrent()
      .then(delete_user_bookmark);

      function delete_user_bookmark(user) {

        // Delete user bookmark
        user
        .deleteBookmark(user_bookmark_to_be_deleted)
        .then(function() {
          // Update scope
          $scope.user_bookmarks.splice(index, 1);
        });
      }
    },

    open: function(link_id) {
      $('#' + link_id).click(true);
    },

    opened: function(index) {

      // Update count
      current_user
      .openBookmark($scope.user_bookmark);

      // Update scope
      $scope.user_bookmarks.splice(index, 1);


    }

  });

})

;

