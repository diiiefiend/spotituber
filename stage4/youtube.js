var youtubeServiceImpl = function ($http, $q, $window, spotifyService) {
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
    if (!sessionStorage.getItem('youtubeToken')) {
      if ($window.location.href.indexOf('access_token=') > -1) {
        sessionStorage.setItem('youtubeToken', $window.location.href.match(/access_token=([^&]*){1}/)[1]);
        $window.location.hash = '';
      } else {
        alert('click the youtube fetch token button first!');
        return $q.reject();
      };
    };

    var trackList = spotifyService.getTracks();

    if (!trackList) {
      alert('first fetch a spotify playlist!');
      return $q.reject();
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
        type: 'video'
      }
    };

    var searchPromises = [];
    trackList.forEach(function (entry) {
      var entryConfig = JSON.parse(JSON.stringify(config));
      entryConfig.params.q = entry.track.name + ' ' + entry.track.artists[0].name; // the actual query terms
      searchPromises.push($http.get(url, entryConfig));
    });

    return $q(function (resolve, reject) {
      $q.all(searchPromises)
        .then(function (response) {
          console.log(response);
          debugger
          // parse the response object, it's too complex
          // response[0].data.items[0].snippet.title, channelTitle
          // response[0].data.items[0].id.videoId
          var simplifiedResponse = [];
          response.forEach(function (entry) {
            var simplifiedEntry = {
              title: entry.data.items[0].snippet.title,
              channel: entry.data.items[0].snippet.channelTitle,
              videoId: entry.data.items[0].id.videoId
            };

            simplifiedResponse.push(simplifiedEntry);
          });

          resolve(simplifiedResponse);
        }).catch(function (err) {
          debugger
          console.log('Boo: ' + err.data);

          reject(err);
        });
    });
  };

  return {
    getToken: getToken,
    lookupVideos: lookupVideos
  };
}

var youtubeController = function ($scope, youtubeService) {
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
        console.log('uh oh: ' + err.data);
      });
  };

  this.createPlaylist = function () {
    console.log('creating...');
  };
};
