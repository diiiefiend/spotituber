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
  .directive('youtubeLookup', function () {
    return {
      restrict: 'E',
      templateUrl: 'youtube-lookup.html',
      controller: ['$scope', 'youtubeService', youtubeController],
      controllerAs: 'youtubeCtrl'
    };
  });
