var spotifyController = function() {
  this.fetch = function() {
    console.log('fetching');
    
  };
};

angular.module('spotituber', [])
  .directive('spotifyLookup', function() {
    return {
      restrict: 'E',
      templateUrl: 'spotify-lookup.html',
      controller: spotifyController,
      controllerAs: 'spotifyCtrl'
    };
  });
