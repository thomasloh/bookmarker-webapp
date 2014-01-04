angular.module( 'services.socialCountPoller',
[
  'ngResource'
])

.factory 'SocialCountPoller', ($resource, $q) ->

  # Constants
  FB_URL   = 'http://api.ak.facebook.com/restserver.php'
  TWTR_URL = 'http://urls.api.twitter.com/1/urls/count.json'

  # State
  state = {}

  # Resource objects
  $facebook = $resource FB_URL, {
    'v'       : '1.0'
    'method'  : 'links.getStats'
    'format'  : 'json'
  }, {
    'get': {
      'method'      : 'GET'
      'isArray'     : true
      'interceptor' : {
        'response': (resp) ->
          if _.isArray(resp.data) and resp.data.length == 1
            resp.data[0]
          else
            resp.data
      }
    }
  }

  $twitter = $resource TWTR_URL, {}, {
    'get': {
      'method'      : 'JSONP'
      'params'      : {
        'callback': 'JSON_CALLBACK'
      }
      'interceptor' : {
        'response': (resp) ->
          resp.data
      }
    }
  }


  # Utilities


  # Facade

  {

    twitter: (url, time, callback) ->

      poll = () ->
        p = $twitter.get({
          url: url
        })
        .$promise

      poll_interval = time
      poll_callback = callback

      # Do it first
      poll()
      .then (data) ->
        # Apply user supplied callback
        poll_callback data

      # Then poll
      setInterval () ->

        poll()
        .then (data) ->
          # Apply user supplied callback
          poll_callback data

      , poll_interval


    facebook: (url, time, callback) ->

      poll = () ->
        p = $facebook.get({
          urls: url
        })
        .$promise

      poll_interval = time
      poll_callback = callback

      # Do it first
      poll()
      .then (data) ->
        # Apply user supplied callback
        poll_callback data

      # Then poll
      setInterval () ->

        poll()
        .then (data) ->
          # Apply user supplied callback
          poll_callback data

      , poll_interval

    linkedin: (url) ->


    pinterest: (url) ->


    google_plus: (url) ->


    reddit: (url) ->




  }
