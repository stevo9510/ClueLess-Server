// Main Node File
// Clueless Game Server

var express = require('express')
var app = express()
var dao = require('./dagame.js');

server = require('http').createServer(app),
port = process.env.PORT || 3000,
io = require('socket.io')(server);

// Server Start
server.listen(port);
console.log('Server listening on port ' + port);

app.use(express.static(__dirname + '/static'));

// Redirect serve index.html
app.get('/',function(req, res){
  res.sendFile(__dirname + '/site/index.html');
});


// Sockets
io.on('connection', function(socket){
  console.log('User connected.');

  // User Joins Game
  socket.on('joinGame', function(data) {
    PlayerJoinedGame(socket)
  });

  // User Makes Move
  socket.on('makeMove', function(data) {
    console.log('MOVE DATA ');
	console.log(data);
	MakeMove(data);
  });
  
  // User Disproves Suggestion
  socket.on('disproveSuggestion', function(data) {
    console.log('DISPROVE SUGGESTION');
	console.log(data);
	SuggestionProofResponseSent(data);
  });

  // User Quits Game
  socket.on('quitGame', function(data) {
    console.log('');
  });

  // User Disconencts
  socket.on('disconnect', function (data) {
      PlayerDisconnectedGame(socket);
    console.log('A user disconnected.');
  });

});

// constants
var CONST_PLAYER_CARD_ENUM_OFFSET = 9;
var CONST_WEAPON_CARD_ENUM_OFFSET = 15;

function PlayerJoinedGame(socket)
{
	// log to server console
	// console.log('socketID: ' + socket.id);
	var playerID = 0;
	
    // find a player that is not active.
    // if game has already started, then try to assign to a player that was dealt cards.  otherwise, that player cannot play
	Object.keys(dao.playerDetails).forEach(function(key) {
	    // have to add the "playerID == 0" condition because there is no break statement using this foreach.  

	    if ((dao.gameStarted == false || dao.playerDetails[key].dealtCards) && dao.playerDetails[key].isActive == false && playerID == 0)
		{
			playerID = key;
		}
	});
	
	// if player was assigned an id.
	if(playerID > 0)
	{
		// activate player
		dao.playerDetails[playerID].isActive = true;
		
		// map playerID to socket to help us send messages to a player later
		playerSockets[playerID] = socket;
		
		// let player know what id they were assigned
		socket.emit('PlayerAssignedID', { playerID: playerID } );

		// get all the players in the game at this point
		var playersInGame = []
		Object.keys(dao.playerDetails).forEach(function(key) 
		{
			if(dao.playerDetails[key].isActive == true)
			{
				playersInGame.push(key);
			}
		});
		// send everyone that list to notify them
		io.sockets.emit('PlayersInGameChanged', { playerIDs: playersInGame } );

		if (dao.gameStarted == true)
		{
            // resume gameplay and notify others of player moves.
		    GeneratePlayerTurnMoves();
		}
		// if everyone is in, start the game
		else if(playersInGame.length == 6)
		{
			StartGame();
		}
	}
	else
	{
		//ignore player.  sorry dude, you can't play
	    io.to(socket.id).emit('GameFull', {});
	}

}

function PlayerDisconnectedGame(socket)
{
    var playerID = 0;
    Object.keys(playerSockets).forEach(function (key) {
        // have to add the "playerID == 0" condition because there is no break statement using this foreach.  
        if (playerSockets[key] == socket && playerID == 0) {
            playerID = key;
        }
    });
    delete playerSockets[playerID];
}

function StartGame()
{
	shuffledCards = ShuffleCards();

	// deal cards.  assumes all 6 players are playing the game.
	for(var ind = 0; ind < shuffledCards.length; ind++)
	{
		var playerIdToDealCard = (ind % 6) + 1;
		dao.playerDetails[playerIdToDealCard].dealtCards.push(shuffledCards[ind]);
	}	
	
	console.log("Case File: ");
	console.log(dao.caseFile);
	// let players know of their cards dealt
	Object.keys(playerSockets).forEach(function(key) {
		console.log('Cards Dealt to Player ' + key);
		console.log(dao.playerDetails[key].dealtCards);
		playerSockets[key].emit('CardsDealt', { cardIDs: dao.playerDetails[key].dealtCards });
	});
	
	dao.gameStarted = true;

	NextTurn();
}

function ShuffleCards()
{
	// declare rooms, characters, weapons array of enums
	var rooms = [1,2,3,4,5,6,7,8,9];
	var characters = [1,2,3,4,5,6];
	var weapons = [1,2,3,4,5,6];
	
	// shuffle them all 
	rooms = ShuffleArray(rooms);
	weapons = ShuffleArray(weapons);
	characters = ShuffleArray(characters);

	// choose case file cards from each (removing from the array via pop)
	dao.caseFile = new Object();
	dao.caseFile.roomID = rooms.pop();
	dao.caseFile.playerID = characters.pop();
	dao.caseFile.weaponID = weapons.pop();
	
	// create deck of cards array
	cards = [];
	
	// build deck of cards from remaining rooms, characters, weapons.  offset value by certain amount to make appropriate card enum 
	CopyFromArrayToAnother(rooms, cards, 0);
	CopyFromArrayToAnother(characters, cards, CONST_PLAYER_CARD_ENUM_OFFSET);
	CopyFromArrayToAnother(weapons, cards, CONST_WEAPON_CARD_ENUM_OFFSET)

	// one last re-shuffle
	cards = ShuffleArray(cards);

	console.log("card deck shuffled");
	console.log(cards);

	return cards;
}	

function ShuffleArray(arr) 
{
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function CopyFromArrayToAnother(source, target, offset)
{
	for(var index = 0; index < source.length; index++)
	{
		target.push(source[index] + offset);
	}
}

function NextTurn()
{
	// update to next turn
	do
	{
		dao.currentTurnPlayerID = (dao.currentTurnPlayerID % 6) + 1;
		// keep looping if player until player is found that is not eliminated
	}while(dao.playerDetails[dao.currentTurnPlayerID].isEliminated == true || dao.playerDetails[dao.currentTurnPlayerID].isActive == false);

	GeneratePlayerTurnMoves();
}

function GeneratePlayerTurnMoves()
{
    // build move options for player
    var playerMoveOptions = [];

    // check where player is currently located
    var currentPlayerLocationID = GetPlayerCurrentLocationID(dao.currentTurnPlayerID);

    var currPlayerTurnDetail = dao.playerDetails[dao.currentTurnPlayerID];

    // case 1: player has not moved yet; allow them to move to default move location
    if (currentPlayerLocationID == 0) {
        CreateMoveOptionAndPush(MoveEnum.MoveToHallway, currPlayerTurnDetail.defaultStartLocation, playerMoveOptions);
    }
    else {
        var currLocDetail = dao.getLocationDetail(currentPlayerLocationID);
        var currLocEdges = currLocDetail.edges;
        var currLocIsRoom = currLocDetail.isRoom;

        console.log("Current Location Edges:");
        console.log(currLocEdges);

        // loop through all bordering locations
        for (var edgeIndex = 0; edgeIndex < currLocEdges.length; edgeIndex++) {
            var edgeLocID = currLocEdges[edgeIndex];
            var edgeDetail = dao.getLocationDetail(edgeLocID);
            console.log(edgeDetail);

            // if bordering location is a room
            if (edgeDetail.isRoom == true) {
                var roomMoveOptionEnum;
                // Case 2: if current location is a room (and bordering location is a room), then this must be a secret passage way
                if (currLocDetail.isRoom == true) {
                    roomMoveOptionEnum = MoveEnum.TakeSecretPassageAndSuggest;
                }
                    // Case 3: if current location is a hallway, and bordering location is a room, then this is simply a move to room and suggest
                else {
                    roomMoveOptionEnum = MoveEnum.MoveToRoomAndSuggest;
                }
                CreateMoveOptionAndPush(roomMoveOptionEnum, edgeLocID, playerMoveOptions);
            }
                // if bordering location is a hallway
            else {
                // check if hallway is empty
                var playersAtLocation = GetPlayerIDsAtCurrentLocation(edgeLocID);
                console.log("players at location: " + playersAtLocation);
                if (playersAtLocation.length == 0) {
                    // Case 4: only allow move if hallway is empty
                    CreateMoveOptionAndPush(MoveEnum.MoveToHallway, edgeLocID, playerMoveOptions);
                }
            }
        }

        // Case 5: If player was moved to current location via suggest, give them the option to stay in the room
        if (currPlayerTurnDetail.wasSuggestedAndMovedLastTurn == true) {
            CreateMoveOptionAndPush(MoveEnum.StayInRoomAndSuggest, currentPlayerLocationID, playerMoveOptions);
            // turn this off now
            currPlayerTurnDetail.wasSuggestedAndMovedLastTurn = false;
        }
    }

    // always give the player the option to make an accusation
    CreateMoveOptionAndPush(MoveEnum.MakeAnAccusation, 0, playerMoveOptions);

    // at this point, if only one move option has been added (i.e. the accusation move) then the user is trapped and has no other moves to make.
    // give them the option to end turn	
    if (playerMoveOptions.length == 1) {
        CreateMoveOptionAndPush(MoveEnum.EndTurn, 0, playerMoveOptions);
    }

    // notify all clients that player turn has changed
    io.sockets.emit('PlayerTurnChanged', { playerID: dao.currentTurnPlayerID });

    // notify current player at turn of their move options
    playerSockets[dao.currentTurnPlayerID].emit('MoveOptions', { moveOptions: playerMoveOptions });

    // wait for client response now to make a move
}

function CreateMoveOptionAndPush(mID, locID, options)
{
	var moveOption = { moveID : mID, locationID : locID };
	options.push(moveOption);
}

function GetPlayerLocation(pID)
{
	for(var index = 0; index < dao.playerLocations.length; index++)
	{
		var playerLoc = dao.playerLocations[index];
		if(playerLoc.playerID == pID)
		{
			return playerLoc;
		}
	}
	return null;
}

function GetPlayerCurrentLocationID(pID)
{
	var playerLoc = GetPlayerLocation(pID);
	if(playerLoc == null)
		return 0;
	
	return playerLoc.locationID;
}

function GetPlayerIDsAtCurrentLocation(locID)
{
	var playerIDs = [];
	for(var index = 0; index < dao.playerLocations.length; index++)
	{
		var playerLoc = dao.playerLocations[index];
		if(playerLoc.locationID == locID)
		{
			playerIDs.push(playerLoc.playerID);
		}
	}
	return playerIDs;
}

function MakeMove(moveData)
{
	switch(moveData.MoveID)
	{
		case MoveEnum.MoveToHallway:
			UpdatePlayerLocation(dao.currentTurnPlayerID, moveData.LocationID);
			NextTurn();
			break;
		case MoveEnum.MoveToRoomAndSuggest:
		case MoveEnum.StayInRoomAndSuggest:
		case MoveEnum.TakeSecretPassageAndSuggest:
			MakeSuggestion(moveData.LocationID, moveData.PlayerID, moveData.WeaponID);
			
			break;
		case MoveEnum.MakeAnAccusation:
			MakeAccusation(moveData.LocationID, moveData.PlayerID, moveData.WeaponID);
			break;
			
		case MoveEnum.EndTurn:
			NextTurn();
			break;
	}
}

function MakeSuggestion(suggRoomID, suggPlayerID, suggWeaponID)
{
	dao.currentSuggestionCards = { playerID : suggPlayerID, weaponID : suggWeaponID, roomID : suggRoomID };
	dao.currentProveTurnPlayerID = 0;
	
	// move the current player 
	UpdatePlayerLocation(dao.currentTurnPlayerID, suggRoomID);
	
	io.sockets.emit("SuggestionMoveMade", 
	{ 
		playerMakingSuggestionID : dao.currentTurnPlayerID,  
		playerID : suggPlayerID,
		weaponID : suggWeaponID,
		roomID : suggRoomID,
	});
	
	// move the suggested player to the suggested room
	var actuallyUpdated = UpdatePlayerLocation(suggPlayerID, suggRoomID);

	if (actuallyUpdated == true)
	{
	    dao.playerDetails[suggPlayerID].wasSuggestedAndMovedLastTurn = true;
	}

	//  we don't need to keep track of the weapon location on server side. just notify everyone its been moved
	io.sockets.emit("WeaponMoved", { weaponID : suggWeaponID, locationID : suggRoomID } );
		
	NextSuggestionProveTurn();
}

function NextSuggestionProveTurn()
{
	// ASSUMES ALL 6 PLAYERS ARE PARTICIPATING IN GAME	
	
	// if first starting suggestion prove turns, then go clockwise from the person 
	if(dao.currentProveTurnPlayerID == 0)
	{
		dao.currentProveTurnPlayerID = (dao.currentTurnPlayerID % 6) + 1;
	}
	else
	{
		// otherwise, just get next prove turn player
		dao.currentProveTurnPlayerID = (dao.currentProveTurnPlayerID % 6) + 1;
	}
	
	// if we've circled back around to the current player, provide them with abililty to accuse or end turn
	if(dao.currentProveTurnPlayerID == dao.currentTurnPlayerID)
	{
		SendCurrentPlayerAccuseAndEndTurnMove();
	}
	else
	{
		// notify all that current prove turn player has changed
		io.sockets.emit('SuggestionProveTurnChanged', { playerID : dao.currentProveTurnPlayerID } );
		
		// provide client with prove options
		var cardOptions = [];
		var suggestionTurnPlayerDetail = dao.playerDetails[dao.currentProveTurnPlayerID];	
		
		for(var index = 0; index < suggestionTurnPlayerDetail.dealtCards.length; index++)
		{
			var cardID = suggestionTurnPlayerDetail.dealtCards[index];
			
			// player has one of the cards suggested to prove the suggestion wrong
			if (cardID == dao.currentSuggestionCards.roomID ||
				cardID == (dao.currentSuggestionCards.playerID + CONST_PLAYER_CARD_ENUM_OFFSET) ||  // Have to do offsets here to get the card enums to match against the PLAYER/WEAPON enums
				cardID == (dao.currentSuggestionCards.weaponID + CONST_WEAPON_CARD_ENUM_OFFSET))
			{
				cardOptions.push(cardID);
			}
		}
		
		console.log("Prove Options:");
		console.log(cardOptions);
		// let single client know of their prove options
		playerSockets[dao.currentProveTurnPlayerID].emit('SuggestionProveOptions', { dummyVal : 0, cardsPlayerCanSelect : cardOptions } );	
	}
	
}

function SendCurrentPlayerAccuseAndEndTurnMove()
{
	var playerMoveOptions = [];
	
	CreateMoveOptionAndPush(MoveEnum.MakeAnAccusation, 0, playerMoveOptions);
	CreateMoveOptionAndPush(MoveEnum.EndTurn, 0, playerMoveOptions);
	
	// notify current player at turn of their move options
	playerSockets[dao.currentTurnPlayerID].emit('MoveOptions', { moveOptions : playerMoveOptions });
	
	// wait for response
}

function SuggestionProofResponseSent(data)
{
	// player debunked the suggestion.  
	if(data.CardID > 0)
	{
		// notify player at turn of the card that debunks the suggestion
		playerSockets[dao.currentTurnPlayerID].emit('SuggestionDebunk', { playerID : dao.currentProveTurnPlayerID, cardID : data.CardID });
		
		// give current turn player option now to accuse or end turn
		SendCurrentPlayerAccuseAndEndTurnMove();
	}
	else
	{
		// player did not have a suggestion proof response.  so skip to the next turn
		NextSuggestionProveTurn();	
	}
}

function MakeAccusation(accRoomID, accPlayerID, accWeaponID)
{
	var isAccCorrect = false;
	
	if(dao.caseFile.roomID == accRoomID 
		&& dao.caseFile.playerID == accPlayerID 
		&& dao.caseFile.weaponID == accWeaponID)
	{
		isAccCorrect = true;
	}
	console.log("isAccCorrect: " + isAccCorrect);
	
	// let everyone know what the accusation was and whether it was correct or not.
	io.sockets.emit('AccusationMoveMade', 
		{ 
			playerThatMadeAccusation : dao.currentTurnPlayerID,  
			playerID : accPlayerID,
			weaponID : accWeaponID,
			roomID : accRoomID,
			isCorrect : isAccCorrect
		}
	);
	
	// let player that made accusation know what the actual result was
	playerSockets[dao.currentTurnPlayerID].emit('AccusationResult', 
	{
		playerID : dao.caseFile.playerID,
		weaponID : dao.caseFile.weaponID,
		roomID : dao.caseFile.roomID
	});
	
	if(isAccCorrect == false)
	{
		var playerDetail = dao.playerDetails[dao.currentTurnPlayerID];
		// eliminate the player, and start the next turn
		playerDetail.isEliminated = true;
		
		// start next turn
		NextTurn();
	}
	else
	{
		// otherwise, game is over.
	}
}

function UpdatePlayerLocation(pID, locID)
{
	var currentLoc = GetPlayerLocation(pID);
	var playerActuallyMoved = true;
	if(currentLoc == null)
	{
		dao.playerLocations.push({ playerID : pID, locationID: locID });
	}
	else if(currentLoc.locationID != locID)
	{	
		currentLoc.locationID = locID;
	}
	else
	{
		playerActuallyMoved = false;
	}	
	
	if(playerActuallyMoved == true)
	{
		io.sockets.emit('PlayerMoved', { playerID : pID, locationID : locID } );
	}
	return playerActuallyMoved;
}

// Client Messages to Server For Reference
// socket.On("AccusationMoveMade", OnAccusationMoveMade);
// socket.On("AccusationResult", OnAccusationResultReceived);
// socket.On("CardsDealt", OnCardsDealt);
// socket.On("MoveOptions", OnMoveOptionsReceived);
// socket.On("PlayerAssignedID", OnPlayerAssignedID);
// socket.On("PlayerMoved", OnPlayerMoved);
// socket.On("PlayersInGameChanged", OnPlayersInGameChanged);
// socket.On("PlayerTurnChanged", OnPlayerTurnChanged);
// socket.On("SuggestionDebunk", OnSuggestionDebunkReceived);
// socket.On("SuggestionMoveMade", OnSuggestionMoveMade);
// socket.On("SuggestionProveOptions", OnSuggestionProveOptionsReceived);
// socket.On("SuggestionProveTurnChanged", OnSuggestionProveTurnChanged);
// socket.On("WeaponMoved", OnWeaponMoved);

  // console.log('User connected.');
