# spotituber

### intro:
 * what is angular
 * brief comparison of ng vs other frameworks
 * key concepts: directive, controller, service (which will be explained later)
 * overview of project and API endpoints we will be using

### stage 1: basic design, html/css

### stage 2: add ng and directives/controllers for spotify
 * why add script tag at bottom of page?
 * what is a directive? what is a controller? why use a directive here and not just a controller?

### stage 3: add services
 * what is a service? factory?
 * what is a promise? (and ng's $q.defer version)
 * using $http.get

### stage 4: add youtubs (directive + controller + service)
 * simple algo (create playlist, search youtube, grab video, and add to playlist)
 * service: create playlist.then foreach song, search youtube for 'artist+song' TYPE video LIMIT 1 SORT BY viewcount.then add to playlist

### wrapup:
 * enhancements: ui-router, resolves, etc
 * testing
 * ng1.x ("angularjs") vs ng2+ ("angular") overview
