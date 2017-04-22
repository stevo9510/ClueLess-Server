Logic Flow

Summary of Game Logic & Messages

# setup
################################################################################

# server on
- server begins listening

# game join
- client sends join game msg(playerID)                    +
- while player_list <= 6
  - player_list.append(player.id)
  - server broadcasts current players                     # PlayersInGameMessage
  - server assigns character.id to player.id


# game setup
- server logic: assign cards to players
- server msg client YOUR CARDS                            # CardsDealtMessage
- server msg client YOUR CHARACTER                        # PlayerAssignedIDMessage



# game play
################################################################################

while gamePlay = True :

# turn start
- server logic: which player is at turn?
- server logic: what moves available to player at turn? => turnOptions
- server broadcast PLAYER AT TURN                         # PlayerTurnMessage
- server msg client available moves                       # MoveOptionMessage

  // a player will be able to do 1 of: move, suggest, or accuse.

# move (if applicable)
- client msg server MOVE                                  +
- server logic: validate msg (screen via turnOptions)
- server broadcast the move just made                     # PlayerMovedMessage

# suggestion (if applicable)
- client msg server SUGGESTION
- server logic: validate msg (screen via turnOptions

- server broadcast the suggestion just made               # SuggestionMoveMadeMessage
- server broadcast who is at turn to prove suggestion     # SuggestionProveTurnMessage
- server msg client2: at turn to prove suggestion.        # SuggestionProveOptionMessage
- either:
  - client2 msg server "will not prove suggestion"        +
  - client2 msg server "prove suggestion"                 +
- either:
  - server msg client: "suggestion was debunked"          # SuggestionDebunkMessage
  - server msg client: "suggestion was proven"            # ???

# accusation (if applicable)
- server logic: validate msg (screen via turnOptions
- client msg server ACCUSATION                            #
- server broadcast accusation made & results              # AccusationMoveMadeMessage
- server msg client: "Final Cards"                        # AccusationResultMessage

# game end
################################################################################
- gamePlay = False
- server broadcast "Game over!"                           # ??? GameOverMessage
