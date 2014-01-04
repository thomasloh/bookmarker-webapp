angular.module( 'leafy', [
  'templates-app',
  'templates-common',
  'leafy.home',
  'leafy.about',
  'services.leafySocket',
  'services.tabActivity',
  'leafy.account',
  'ui.state',
  'ui.route'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run (leafySocket, tabActivity) {
  leafySocket.init();
  tabActivity.init();
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | leafy' ;
    }

  });
});


