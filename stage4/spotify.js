var spotifyServiceImpl = function ($http, $q, $window) {
  var tracksArr;

  // unfortunately have to do it this way unless I want to set up a backend...
  var getToken = function () {
    // GET https://accounts.spotify.com/authorize
    var url = 'https://accounts.spotify.com/authorize?';
    var params = {
      client_id: creds.spotify.client_id,
      response_type: 'token',
      redirect_uri: 'http://localhost:8080/stage4'
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
        return $q.reject();
      };
    };

    //$http.get request to GET https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
    var url = 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks';
    var config = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('spotifyToken')
      },
      params: {
        fields: 'items(track(name,artists(name)))'
      }
    };

    return $q(function (resolve, reject) {
      $http.get(url, config)
        .then(function (response) {
          console.log(response);
          tracksArr = response.data.items;  //is an array of track objects
          resolve(tracksArr);
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
    return tracksArr;
  }

  return {
    getToken: getToken,
    fetchPlaylist: fetchPlaylist,
    getTracks: getTracks
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
