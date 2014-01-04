angular.module( 'services.leafy',
[
  'services.leafy.user'
])

.factory 'Leafy', (User) ->

  {

    # Session
    # --------------------------------------------
    # Session: Session

    # Entities
    # --------------------------------------------
    User: User

    # Bookmark: Bookmark

  }

