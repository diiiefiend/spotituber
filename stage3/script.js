var spotifyServiceImpl = function ($http, $q, $window) {
  // unfortunately have to do it this way unless I want to set up a backend...
  var getToken = function () {
    // GET https://accounts.spotify.com/authorize
    var url = 'https://accounts.spotify.com/authorize?';
    var params = {
      client_id: creds.spotify.client_id,
      response_type: 'token',
      redirect_uri: 'http://localhost:8080/stage3'
    };
    var paramsStr = Object.entries(params).reduce(function (base, entry){
      return base + entry[0] + '=' + entry[1] + '&';
    }, '').slice(0, -1);

    $window.location.href = url + paramsStr;
  };

  var fetchPlaylist = function (userId, playlistId) {
    if (!localStorage.getItem('spotifyToken')) {
      if ($window.location.href.indexOf('access_token=') > -1) {
        localStorage.setItem('spotifyToken', $window.location.href.match(/access_token=([^&]*){1}/)[1]);
      } else {
        alert('click the fetch token button first!');
        return $q.reject();
      };
    };

    //$http.get request to GET https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
    var url = 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks';
    var config = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('spotifyToken')
      },
      params: {
        fields: 'items(track(name,artists(name)))'
      }
    };

    return $q(function (resolve, reject) {
      $http.get(url, config)
        .then(function (response) {
          console.log(response);
          resolve(response.data.items); //is an array of track objects
        }).catch(function (err) {
          console.log('Boo: ' + err.data.error.message);
          reject(err);
        });
    });
  };

  return {
    getToken: getToken,
    fetchPlaylist: fetchPlaylist
  };
};

var spotifyController = function ($scope, spotifyService) {
  this.getToken = function () {
    spotifyService.getToken();
  };

  this.fetch = function () {
    console.log('fetching');

    if (!this.userId || !this.playlistId) {
      console.log('using default spotify ids....');
      this.userId = 'diiiefiend';
      this.playlistId = '0gwpZtS2J0HYrBn2gJPM0c';
    };

    spotifyService.fetchPlaylist(this.userId, this.playlistId)
      .then(function (data) {
        // using $scope here to trigger the auto-re-render
        $scope.tracksArr = data;
      }).catch(function (err) {
        console.log('uh oh: ' + err.data.error.message);
      });
  };
};

angular.module('spotituber', [])
  .factory('spotifyService', ['$http', '$q', '$window', spotifyServiceImpl])
  .controller('spotifyController', ['$scope', 'spotifyService', spotifyController])
  .directive('spotifyLookup', function () {
    return {
      restrict: 'E',
      templateUrl: 'spotify-lookup.html',
      controller: spotifyController,
      controllerAs: 'spotifyCtrl'
    };
  });
