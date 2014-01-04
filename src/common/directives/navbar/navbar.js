angular.module( 'directives.navbar', [] )

.directive( 'navbar', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/navbar/navbar.tpl.html',
    link: function(scope, element, attributes) {
    }
  };
})

;

