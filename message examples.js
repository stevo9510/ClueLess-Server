// PlayerAssignedIDMessage
{
  "messageID": 1,
  "playerID": 5
}



// PlayersInGameMessage
{
  "messageID": 2,
  "playerIDs": [
    3,
    4
  ]
}



// CardsDealtMessage
{
  "messageID": 3,
  "cardIDs": [
    7,
    15,
    18
  ]
}



// PlayerTurnMessage
{
  "messageID": 4,
  "playerID": 1
}



//MoveOptionMessage
{
  "messageID": 5,
  "moveOptions": [
    {
      "moveID": 1,
      "locationID": 15
    },
    {
      "moveID": 5
    }
  ]
}



// SuggestionMoveMadeMessage
{
  "messageID": 6,
  "playerThatMadeSuggestion": 2,
  "playerID": 5,
  "roomID": 2,
  "weaponID": 4
}



// SuggestionProveTurnMessage
{
  "messageID": "7",
  "playerID": "3"
}



// SuggestionProveOptionMessage
{
  "messageID": 8,
  "cardsPlayerCanSelect": [
    8,
    17
  ]
}



// SuggestionDebunkMessage
{
  "messageID": 9,
  "cardID": 10,
  "playerID": 6
}



// PlayerMovedMessage
{
  "messageID": 10,
  "playerID": 1,
  "locationID": 5
}



// AccusationMoveMadeMessage
{
  "messageID": 11,
  "playerThatMadeAccusation": 2,
  "playerID": 2,
  "roomID": 3,
  "weaponID": 5,
  "isCorrect": false
}



// AccusationResultMessage
{
  "messageID": 12,
  "playerID": 6,
  "roomID": 3,
  "weaponID": 5,
}
