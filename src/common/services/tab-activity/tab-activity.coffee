angular.module( 'services.tabActivity', [])

.factory 'tabActivity', () ->

  # Init
  is_active = true

  # Constants

  # State

  # Resource objects


  # Utilities


  # Facade

  {
    init: () ->
      window.onfocus = () ->
        is_active = true

      window.onblur = () ->
        is_active = false

    get: () ->
      !!is_active
  }

