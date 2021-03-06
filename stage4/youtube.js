var youtubeServiceImpl = function ($http, $q, $window, spotifyService) {
  var playlistArr;

  // 'private' methods
  var errorHandler = function (err) {
    var errorMessage = err.data.error.message;
    console.log('Boo: ' + errorMessage);

    if (errorMessage === 'Invalid Credentials') {
      sessionStorage.removeItem('youtubeToken');
      alert('Please generate new token');
    };

    return $q.reject(err);
  };

  var setToken = function () {
    // here we should set the Youtube OAuth token
    // TODO: IMPLEMENTATION LEFT AS EXERCISE FOR READER
  };

  var fixSrc = function (embedPlayerHtml) {
    var videoIds = '?playlist=';
    var idx;
    for (idx = 1; idx < playlistArr.length; idx++) {
      videoIds += playlistArr[idx].videoId + ',';
    };

    return embedPlayerHtml.replace(/videoseries[^"]*/, playlistArr[0].videoId + videoIds);
  };

  var addVideosToPlaylist = function (playlistId) {
    // POST https://www.googleapis.com/youtube/v3/playlistItems
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems';
    var body = {
      snippet: {
        playlistId: playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId: ''
        }
      }
    };
    var config = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('youtubeToken')
      },
      params: {
        part: 'snippet'
      }
    };

    // have to resolve these promises sequentially since the parallel implementation
    // seems to make youtube malfunction
    var insertPromiseFns = [];
    playlistArr.forEach(function (entry) {
      var entryBody = JSON.parse(JSON.stringify(body));
      entryBody.snippet.resourceId.videoId = entry.videoId;
      var promiseFn = function () {
        return $http.post(url, entryBody, config);
      };
      insertPromiseFns.push(promiseFn);
    });

    return $q(function (resolve, reject) {
      insertPromiseFns.reduce(function(cur, next) {
        return cur.then(next);
      }, $q.resolve())
        .then(function (response) {
          console.log('added the videos!');

          resolve();
        }).catch(errorHandler);
    });
  };

  // 'public' methods
  var getToken = function () {
    // GET https://accounts.google.com/o/oauth2/v2/auth
    var url = 'https://accounts.google.com/o/oauth2/v2/auth?';
    var params = {
      client_id: creds.youtube.client_id,
      response_type: 'token',
      redirect_uri: 'http://localhost:8080/stage4',
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl'
    };
    var paramsStr = Object.entries(params).reduce(function (base, entry){
      return base + entry[0] + '=' + entry[1] + '&';
    }, '').slice(0, -1);

    $window.location.href = url + paramsStr;
  };

  var lookupVideos = function () {
    setToken();

    if (!sessionStorage.getItem('youtubeToken')) {
      alert('click the youtube fetch token button first!');
      return $q.reject({data: {error: {message: 'invalid token'}}});
    };

    var trackList = spotifyService.getTracks();

    if (!trackList) {
      alert('first fetch a spotify playlist!');
      return $q.reject({data: {error: {message: 'no playlist'}}});
    };

    // GET https://www.googleapis.com/youtube/v3/search
    var url = 'https://www.googleapis.com/youtube/v3/search';
    var config = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('youtubeToken')
      },
      params: {
        part: 'snippet',
        maxResults: 1,
        order: 'relevance',
        type: 'video',
        q: ''
      }
    };

    var searchPromises = [];
    trackList.forEach(function (entry) {
      var entryConfig = JSON.parse(JSON.stringify(config));
      entryConfig.params.q = entry.track.name + ' ' + entry.track.artists[0].name; // the actual query terms
      searchPromises.push($http.get(url, entryConfig));
    });

    return $q(function (resolve, reject) {
      // let's search youtube for all these videos
      // TODO: IMPLEMENTATION LEFT AS EXERCISE FOR READER
    });
  };

  var createPlaylist = function () {
    setToken();

    if (!sessionStorage.getItem('youtubeToken')) {
      alert('click the youtube fetch token button first!');
      return $q.reject({data: {error: {message: 'invalid token'}}});
    };

    if (!playlistArr) {
      alert('first fetch the video playlist!');
      return $q.reject({data: {error: {message: 'no playlist'}}});
    };

    // POST https://www.googleapis.com/youtube/v3/playlists
    var url = 'https://www.googleapis.com/youtube/v3/playlists';
    var body = {
      snippet: {
        title: spotifyService.getPlaylistName(),
        privacyStatus: 'private'
      }
    };
    var config = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('youtubeToken')
      },
      params: {
        part: 'snippet,status,player'
      }
    };

    return $q(function (resolve, reject) {
      // create the playlist and add the videos
      // TODO: IMPLEMENTATION LEFT AS EXERCISE FOR READER
    });
  };

  return {
    getToken: getToken,
    lookupVideos: lookupVideos,
    createPlaylist: createPlaylist
  };
}

var youtubeController = function ($scope, $rootScope, $sce, youtubeService) {
  $scope.canLookup = false;

  this.getToken = function () {
    youtubeService.getToken();
  };

  this.lookupVideos = function () {
    console.log('looking up...');
    youtubeService.lookupVideos()
      .then(function (data) {
        // using $scope here to trigger the auto-re-render
        $scope.videosArr = data;
      }).catch(function (err) {
        console.log('uh oh: ' + err.data.error.message);
      });
  };

  this.createPlaylist = function () {
    console.log('creating...');
    youtubeService.createPlaylist()
      .then(function (data) {
        $scope.playlistName = data.name;
        $scope.playlistUrl = 'https://www.youtube.com/watch?v=' + $scope.videosArr[0].videoId + '&list=' + data.id;
        $scope.playerHtml = $sce.trustAsHtml(data.playerHtml);
      }).catch(function (err) {
        console.log('uh oh: ' + err.data.error.message);
      });
  };

  $rootScope.$on('spotifyTracksFetched', function() {
    $scope.canLookup = true;
  });
};
