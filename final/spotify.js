var spotifyServiceImpl = function ($http, $q, $window) {
  var tracksObj;

  // unfortunately have to do it this way unless I want to set up a backend...
  var getToken = function () {
    // GET https://accounts.spotify.com/authorize
    var url = 'https://accounts.spotify.com/authorize?';
    var params = {
      client_id: creds.spotify.client_id,
      response_type: 'token',
      redirect_uri: $window.location.origin + $window.location.pathname
    };
    var paramsStr = Object.entries(params).reduce(function (base, entry){
      return base + entry[0] + '=' + entry[1] + '&';
    }, '').slice(0, -1);

    $window.location.href = url + paramsStr;
  };

  var fetchPlaylist = function (userId, playlistId) {
    if (!sessionStorage.getItem('spotifyToken')) {
      if ($window.location.href.indexOf('access_token=') > -1) {
        sessionStorage.setItem('spotifyToken', $window.location.href.match(/access_token=([^&]*){1}/)[1]);
        $window.location.hash = '';
      } else {
        alert('click the spotify fetch token button first!');
        return $q.reject({data: {error: {message: 'invalid token'}}});
      };
    };

    // GET https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}
    var url = 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId;
    var config = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('spotifyToken')
      },
      params: {
        fields: 'name,tracks.items(track(name,artists(name)))'
      }
    };

    return $q(function (resolve, reject) {
      $http.get(url, config)
        .then(function (response) {
          console.log(response);
          tracksObj = {
            name: response.data.name,
            tracks: response.data.tracks.items //is an array of track objects
          };
          resolve(tracksObj);
        }).catch(function (err) {
          var errorMessage = err.data.error.message;
          console.log('Boo: ' + errorMessage);
          if (['The access token expired', 'Invalid access token'].indexOf(errorMessage) > -1) {
            sessionStorage.removeItem('spotifyToken');
            alert('Please generate new token');
          };

          reject(err);
        });
    });
  };

  var getTracks = function () {
    return  tracksObj ? tracksObj.tracks : undefined;
  }

  var getPlaylistName = function () {
    return tracksObj ? tracksObj.name : undefined;
  }

  return {
    getToken: getToken,
    fetchPlaylist: fetchPlaylist,
    getTracks: getTracks,
    getPlaylistName: getPlaylistName
  };
};

var spotifyController = function ($scope, $rootScope, spotifyService) {
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
        $scope.tracksObj = data;
        $rootScope.$emit('spotifyTracksFetched');
      }).catch(function (err) {
        console.log('uh oh: ' + err.data.error.message);
      });
  };
};
