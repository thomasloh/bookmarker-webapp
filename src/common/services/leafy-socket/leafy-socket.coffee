angular.module( 'services.leafySocket', [])

.factory 'leafySocket', () ->

  # Init
  socket = null

  # Constants

  # State
  state = {}

  # Resource objects


  # Utilities


  # Facade

  {
    init: () ->
      socket = io.connect('http://localhost:8005')

    get: () ->
      socket
  }

