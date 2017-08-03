angular.module('spotituber', [])
  .factory('spotifyService', ['$http', '$q', '$window', spotifyServiceImpl])
  .directive('spotifyLookup', function () {
    return {
      restrict: 'E',
      templateUrl: 'spotify-lookup.html',
      controller: ['$scope', 'spotifyService', spotifyController],
      controllerAs: 'spotifyCtrl'
    };
  })
  .factory('youtubeService', ['$http', '$q', '$window', 'spotifyService', youtubeServiceImpl])
  .controller('youtubeController', ['$scope', '$sce', 'youtubeService', youtubeController])
  .directive('youtubeLookup', function () {
    return {
      restrict: 'E',
      templateUrl: 'youtube-lookup.html',
      controller: 'youtubeController',
      controllerAs: 'youtubeCtrl'
    };
  });
