angular.module( 'services.leafy.user',
[
  'ngResource',
  'services.leafy.config'
])

.factory 'User', ($resource, LeafyConfig, $q) ->

  # Constants
  prefix = LeafyConfig.api_prefix

  # State
  state = {}

  # Resource objects
  $user = $resource prefix + 'users/:uid/ ', {}, {
    'getBookmarks': {
      method  : 'GET'
      isArray : true
      url     : prefix + 'users/:uid/bookmarks/ '
    }
    'deleteBookmark': {
      method: 'DELETE'
      url     : prefix + 'users/:uid/bookmarks/:bid/ '
    }
    'openBookmark': {
      method  : 'DELETE'
      url     : prefix + 'users/:uid/bookmarks/:bid/ '
    }
    'updateSocialData': {
      method  : 'PATCH'
      url     : prefix + 'users/:uid/bookmarks/:bid/social/ '
    }
  }

  $session = $resource 'session', {}

  # Utilities

  ensure_session = () ->
    if !state.current_user
      throw new Error 'No current user'

    if !state.current_user.id
      throw new Error 'Current user has no id'

  validate_bookmark = (user_bookmark) ->
    if not angular.isObject(user_bookmark)
      throw new Error 'User bookmark must be an object'

    if not user_bookmark.id
      throw new Error 'User bookmark must have an id'


  {
    id: null,

    json: () ->
      state.current_user

    getBookmarks: () ->

      # Session check
      ensure_session()

      # Get user bookmarks
      $user
      .getBookmarks({
        uid: state.current_user.id
      })
      .$promise

    deleteBookmark: (user_bookmark) ->

      # Session check
      ensure_session()

      # Validate user bookmark
      validate_bookmark user_bookmark

      # Delete user bookmark
      $user
      .deleteBookmark({
        uid: state.current_user.id
        bid: user_bookmark.id
      })
      .$promise

    # Get current logged in user
    getCurrent: () ->

      if state.authenticated && state.current_user
        return $q.when this

      # Create a promise
      d = $q.defer()

      # Grab session
      $session
      .get()
      .$promise
      .then (response) =>
        if response.authenticated && response.current_user
          # Keep track of current user
          state.current_user  = response.current_user
          this.id             = state.current_user.id
          state.authenticated = true
          # Resolve
          d.resolve this

      # Returns a promise
      d.promise

    openBookmark: (user_bookmark) ->

      # Session check
      ensure_session()

      # Validate user bookmark
      validate_bookmark user_bookmark

      # Update bookmark count
      $user
      .openBookmark({
        uid: state.current_user.id
        bid: user_bookmark.id
      }, {})
      .$promise

  }
