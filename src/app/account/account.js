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
angular.module( 'leafy.account', [
  'ui.state',
  'directives.accountNav',
  'leafy.account.export',
  'leafy.account.manageEmail',
  'services.leafy',
  'services.underscore'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider
  .state( 'account', {
    url: '/account',
    views: {
      "main": {
        controller: 'AccountCtrl',
        templateUrl: 'account/account.tpl.html'
      }
    },
    data:{ pageTitle: 'Account' }
  })
  .state( 'manageEmail', {
    url: '/account/email',
    views: {
      "main": {
        controller: 'ManageEmailCtrl',
        templateUrl: 'account/manage-email/manage-email.tpl.html'
      }
    },
    data:{ pageTitle: 'Account' }
  })
  .state( 'export', {
    url: '/export',
    views: {
      "main": {
        controller: 'ExportCtrl',
        templateUrl: 'account/export/export.tpl.html'
      }
    },
    data:{ pageTitle: 'Export' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'AccountCtrl', function AccountController( $scope, Leafy, _) {

  var current_user;

  Leafy
  .User
  .getCurrent()
  .then(show_account_info);

  // Utilities

  function show_account_info(user) {

    // Track
    current_user = user;

  }

})

.controller( 'AccountNavCtrl', function AccountController( $scope, Leafy, $location, _) {

  // Show tooltips
  $('.account').tooltip({
    placement: 'right'
  });
  $('.export').tooltip({
    placement: 'right'
  });

  $scope.navClass = function(path) {

    if ($location.path().match(path)) {
      return 'active';
    } else {
      return '';
    }

  };

})

;

