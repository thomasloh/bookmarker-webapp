angular.module( 'directives.accountNav', [] )

.directive( 'accountNav', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/account-nav/account-nav.tpl.html',
    link: function(scope, element, attributes, $location) {
    }
  };
})

;

