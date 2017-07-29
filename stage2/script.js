var spotifyController = function() {
  this.testFn = function() {
    console.log('hi');
  };
};

angular.module('spotituber', [])
  .directive('spotifyLookup', function() {
    return {
      restrict: 'E',
      template: '<p>Geez this is spotify</p>',
      controller: spotifyController
    };
  });
