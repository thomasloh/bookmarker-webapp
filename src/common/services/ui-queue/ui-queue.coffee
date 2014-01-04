angular.module( 'services.uiQueue', [])

.factory 'uiQueue', () ->

  # Init
  queue = []
  len   = 0

  # Constants

  # State
  state = {
    registrants: []
    last_pushed: null
  }

  # Resource objects

  # Utilities
  flush = () ->
    if !queue.length
      return

    cycle_multiplier = 1

    _.each queue, (item, index) ->

      if !item
        cycle_multiplier += (Math.PI + index) / 2
        return

      do (fn = item.fn, v = item.v, i = index) ->
        _.delay () ->
          _.defer () ->
            fn(v)
        , (if i % 2 == 0 then 450 else 900) * cycle_multiplier

    console.log 'Clearing ui queue'
    queue = []
    len   = 0

  notify_registrants = () ->
    _.each state.registrants, (r) ->
      r len

  time_for_new_cycle = () ->
    if !state.last_pushed
      state.last_pushed = moment Date.now()
      false
    else if Math.abs(state.last_pushed.diff moment Date.now()) > 1000
      state.last_pushed = moment Date.now()
      true
    else
      state.last_pushed = moment Date.now()
      false

  # Facade

  {

    get: () ->
      queue

    push: (data) ->
      if time_for_new_cycle()
        queue.push false
      else
        queue.push data
        len++
        notify_registrants()

    count: () ->
      len

    register: (cb) ->
      do (fn = cb) ->
        state.registrants.push fn

    flush: () ->
      flush()


  }

