// Main Node File
// Clueless Game Server

var express = require('express')
var app = express()

server = require('http').createServer(app),
port = process.env.PORT || 3000,
io = require('socket.io')(server);

// Server Start
server.listen(port);
console.log('Server listening on port 3000.');


app.use(express.static(__dirname + '/static'));

// Redirect serve index.html
app.get('/',function(req, res){
  res.sendFile(__dirname + '/site/index.html');
});


// Sockets
io.on('connection', function(socket){
  console.log('User connected.');

  // TODO delete this later  ... just for config testing
  socket.on('connection-test-message', function(msg){
    io.sockets.emit('connection-test-message', msg)
  });


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
  socket.on('disconnect', function(data) {
    console.log('A user disconnected.');
  });

});


// DECLARE ENUMS 
PlayerEnum = 
{
	Scarlet : 1,
	Mustard : 2,
	Orchid : 3,
	Green : 4,
	Peacock : 5,
	Plum : 6
}

LocEnum =
{ 
	Study : 1,
    Hall : 2,
    Lounge : 3,
    Library : 4,
    BilliardRoom : 5,
    DiningRoom : 6,
    Conservatory : 7,
    Ballroom : 8,
    Kitchen : 9,
    StudyHall : 10,
    HallLounge : 11,
    StudyLib : 12, 
    HallBill : 13,
    LoungeDin : 14,
    LibBill : 15,
    BillDin : 16,
    LibCon : 17,
    BillBall : 18,
    DinKitch : 19,
    ConBall : 20,
    BallKitch : 21
}

MoveEnum =
{
	MoveToHallway : 1,
	TakeSecretPassageAndSuggest : 2,
	MoveToRoomAndSuggest : 3, 
	StayInRoomAndSuggest : 4,
	MakeAnAccusation : 5,
	EndTurn : 6
}

// Setup all the playerDetails and add to this dictionary for referencing
var playerDetailsDictionary = {}

for(var index = 1; index <= 6; index++)
{
	// index = playerID / enum.  
	playerDetailsDictionary[index] = 
	{
		dealtCards : [],
		isActive : false,
		isEliminated : false,
		wasSuggestedAndMovedLastTurn : false
	};
}
// Define the default starting positions for all the locations
playerDetailsDictionary[PlayerEnum.Scarlet].defaultStartLocation = LocEnum.HallLounge; 
playerDetailsDictionary[PlayerEnum.Mustard].defaultStartLocation = LocEnum.LoungeDin; 
playerDetailsDictionary[PlayerEnum.Orchid].defaultStartLocation = LocEnum.BallKitch; 
playerDetailsDictionary[PlayerEnum.Green].defaultStartLocation = LocEnum.ConBall; 
playerDetailsDictionary[PlayerEnum.Peacock].defaultStartLocation = LocEnum.LibCon; 
playerDetailsDictionary[PlayerEnum.Plum].defaultStartLocation = LocEnum.StudyLib; 

// Initialize all the Location Detail Information and Setup Their Edges 
var locationDetailsDictionary = {};
locationDetailsDictionary[LocEnum.Study] = 
{
	edges : [LocEnum.Kitchen, LocEnum.StudyHall, LocEnum.StudyLib],
	isRoom : true
};

locationDetailsDictionary[LocEnum.Hall] = 
{
	edges : [LocEnum.StudyHall, LocEnum.HallLounge, LocEnum.HallBill],
	isRoom : true
};

locationDetailsDictionary[LocEnum.Lounge] = 
{
	locationID : LocEnum.Lounge,
	edges : [LocEnum.Conservatory, LocEnum.HallLounge, LocEnum.LoungeDin],
	isRoom : true
};

locationDetailsDictionary[LocEnum.Library] = 
{
	locationID : LocEnum.Library,
	edges : [LocEnum.StudyLib, LocEnum.LibBill, LocEnum.LibCon],
	isRoom : true
};

locationDetailsDictionary[LocEnum.BilliardRoom] = 
{
	locationID : LocEnum.BilliardRoom,
	edges : [LocEnum.LibBill, LocEnum.HallBill, LocEnum.BillDin, LocEnum.BillBall],
	isRoom : true
};

locationDetailsDictionary[LocEnum.DiningRoom] = 
{
	locationID : LocEnum.DiningRoom,
	edges : [LocEnum.LoungeDin, LocEnum.BillDin, LocEnum.DinKitch],
	isRoom : true
};

locationDetailsDictionary[LocEnum.Conservatory] = 
{
	locationID : LocEnum.Conservatory,
	edges : [LocEnum.Lounge, LocEnum.LibCon, LocEnum.ConBall],
	isRoom : true
};

locationDetailsDictionary[LocEnum.Ballroom] = 
{
	locationID : LocEnum.Ballroom,
	edges : [LocEnum.ConBall, LocEnum.BillBall, LocEnum.BallKitch],
	isRoom : true
};

locationDetailsDictionary[LocEnum.Kitchen] = 
{
	locationID : LocEnum.Kitchen,
	edges : [LocEnum.Study, LocEnum.BallKitch, LocEnum.DinKitch],
	isRoom : true
};

locationDetailsDictionary[LocEnum.StudyHall] = 
{
	locationID : LocEnum.StudyHall,
	edges : [LocEnum.Study, LocEnum.Hall],
	isRoom : false
};

locationDetailsDictionary[LocEnum.HallLounge] = 
{
	locationID : LocEnum.HallLounge,
	edges : [LocEnum.Hall, LocEnum.Lounge],
	isRoom : false
};

locationDetailsDictionary[LocEnum.StudyLib] = 
{
	locationID : LocEnum.StudyLib,
	edges : [LocEnum.Study, LocEnum.Library],
	isRoom : false
};

locationDetailsDictionary[LocEnum.HallBill] = 
{
	locationID : LocEnum.HallBill,
	edges : [LocEnum.Hall, LocEnum.BilliardRoom],
	isRoom : false
};

locationDetailsDictionary[LocEnum.LoungeDin] = 
{
	locationID : LocEnum.LoungeDin,
	edges : [LocEnum.Lounge, LocEnum.DiningRoom],
	isRoom : false
};

locationDetailsDictionary[LocEnum.LibBill] = 
{
	locationID : LocEnum.LibBill,
	edges : [LocEnum.Library, LocEnum.BilliardRoom],
	isRoom : false
};

locationDetailsDictionary[LocEnum.BillDin] = 
{
	locationID : LocEnum.BillDin,
	edges : [LocEnum.BilliardRoom, LocEnum.DiningRoom],
	isRoom : false
};

locationDetailsDictionary[LocEnum.LibCon] = 
{
	locationID : LocEnum.LibCon,
	edges : [LocEnum.Library, LocEnum.Conservatory],
	isRoom : false
};

locationDetailsDictionary[LocEnum.BillBall] = 
{
	locationID : LocEnum.BillBall,
	edges : [LocEnum.BilliardRoom, LocEnum.Ballroom],
	isRoom : false
};

locationDetailsDictionary[LocEnum.DinKitch] = 
{
	locationID : LocEnum.DinKitch,
	edges : [LocEnum.DiningRoom, LocEnum.Kitchen],
	isRoom : false
};

locationDetailsDictionary[LocEnum.ConBall] = 
{
	locationID : LocEnum.ConBall,
	edges : [LocEnum.Conservatory, LocEnum.Ballroom],
	isRoom : false
};

locationDetailsDictionary[LocEnum.BallKitch] = 
{
	locationID : LocEnum.BallKitch,
	edges : [LocEnum.Ballroom, LocEnum.Kitchen],
	isRoom : false
};


// Declare gameplay variables that are stored in memory.  "Our DAO layer"
var playerLocations = []; // Will Store an Array of {PlayerID, LocationID} objects
var caseFile; // should contain a playerID, weaponID, and roomID
var currentTurnPlayerID = 0; 
var currentProveTurnPlayerID = 0;  
var currentSuggestionCards;
var playerSockets = {};  // a dictionary of PlayerIDs (the key) to Socket.IO sockets.  

// constants
var CONST_PLAYER_CARD_ENUM_OFFSET = 9;
var CONST_WEAPON_CARD_ENUM_OFFSET = 15;

function PlayerJoinedGame(socket)
{
	// log to server console
	// console.log('socketID: ' + socket.id);
	var playerID = 0;
	
	// find a player that is not active 
	Object.keys(playerDetailsDictionary).forEach(function(key) {
		// have to add the "playerID == 0" condition because there is no break statement using this foreach.  
		if(playerDetailsDictionary[key].isActive == false && playerID == 0)
		{
			playerID = key;
		}
	});
	
	// if player was assigned an id.
	if(playerID > 0)
	{
		// activate player
		playerDetailsDictionary[playerID].isActive = true;
		
		// map playerID to socket to help us send messages to a player later
		playerSockets[playerID] = socket;
		
		// let player know what id they were assigned
		socket.emit('PlayerAssignedID', { playerID: playerID } );

		// get all the players in the game at this point
		var playersInGame = []
		Object.keys(playerDetailsDictionary).forEach(function(key) 
		{
			if(playerDetailsDictionary[key].isActive == true)
			{
				playersInGame.push(key);
			}
		});
		// send everyone that list to notify them
		io.sockets.emit('PlayersInGameChanged', { playerIDs: playersInGame } );

		// if everyone is in, start the game
		if(playersInGame.length == 6)
		{
			StartGame();
		}
	}
	else
	{
		//ignore player.  sorry dude, you can't play
    io.to(socket.id).emit('error',"sorry dude, you can't play.")
	}

}

function StartGame()
{
	shuffledCards = ShuffleCards();

	// deal cards.  assumes all 6 players are playing the game.
	for(var ind = 0; ind < shuffledCards.length; ind++)
	{
		var playerIdToDealCard = (ind % 6) + 1;
		playerDetailsDictionary[playerIdToDealCard].dealtCards.push(shuffledCards[ind]);
	}	
	
	console.log("Case File: ");
	console.log(caseFile);
	// let players know of their cards dealt
	Object.keys(playerSockets).forEach(function(key) {
		console.log('Cards Dealt to Player ' + key);
		console.log(playerDetailsDictionary[key].dealtCards);
		playerSockets[key].emit('CardsDealt', { cardIDs: playerDetailsDictionary[key].dealtCards });
	});
	
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
	caseFile = new Object();
	caseFile.roomID = rooms.pop();
	caseFile.playerID = characters.pop();
	caseFile.weaponID = weapons.pop();
	
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
		currentTurnPlayerID = (currentTurnPlayerID % 6) + 1;
		// keep looping if player until player is found that is not eliminated
	}while(playerDetailsDictionary[currentTurnPlayerID].isEliminated == true);

	// build move options for player
	var playerMoveOptions = [];
	
	// check where player is currently located
	var currentPlayerLocationID = GetPlayerCurrentLocationID(currentTurnPlayerID);
	
	var currPlayerTurnDetail = playerDetailsDictionary[currentTurnPlayerID];
		
	// case 1: player has not moved yet; allow them to move to default move location
	if(currentPlayerLocationID == 0)
	{
		CreateMoveOptionAndPush(MoveEnum.MoveToHallway, currPlayerTurnDetail.defaultStartLocation, playerMoveOptions);
	}
	else
	{		
		var currLocDetail = locationDetailsDictionary[currentPlayerLocationID];
		var currLocEdges = currLocDetail.edges;
		var currLocIsRoom = currLocDetail.isRoom;
		
		console.log("Current Location Edges:");
		console.log(currLocEdges);

		// loop through all bordering locations
		for (var edgeIndex = 0; edgeIndex < currLocEdges.length; edgeIndex++)
		{
		    var edgeLocID = currLocEdges[edgeIndex];
			var edgeDetail = locationDetailsDictionary[edgeLocID];
			console.log(edgeDetail);

			// if bordering location is a room
			if(edgeDetail.isRoom == true)
			{
				var roomMoveOptionEnum;
				// Case 2: if current location is a room (and bordering location is a room), then this must be a secret passage way
				if(currLocDetail.isRoom == true)
				{
					roomMoveOptionEnum = MoveEnum.TakeSecretPassageAndSuggest;
				}
				// Case 3: if current location is a hallway, and bordering location is a room, then this is simply a move to room and suggest
				else
				{
					roomMoveOptionEnum = MoveEnum.MoveToRoomAndSuggest;
				}
				CreateMoveOptionAndPush(roomMoveOptionEnum, edgeLocID, playerMoveOptions);
			}
			// if bordering location is a hallway
			else
			{
				// check if hallway is empty
			    var playersAtLocation = GetPlayerIDsAtCurrentLocation(edgeLocID);
			    console.log("players at location: " + playersAtLocation);
				if(playersAtLocation.length == 0)
				{
					// Case 4: only allow move if hallway is empty
					CreateMoveOptionAndPush(MoveEnum.MoveToHallway, edgeLocID, playerMoveOptions);
				}
			}
		}	
		
		// Case 5: If player was moved to current location via suggest, give them the option to stay in the room
		if(currPlayerTurnDetail.wasSuggestedAndMovedLastTurn == true)
		{
			CreateMoveOptionAndPush(MoveEnum.StayInRoomAndSuggest, currentPlayerLocationID, playerMoveOptions);
			// turn this off now
			currPlayerTurnDetail.wasSuggestedAndMovedLastTurn = false; 
		}
	}
	
	// always give the player the option to make an accusation
	CreateMoveOptionAndPush(MoveEnum.MakeAnAccusation, 0, playerMoveOptions);

	// at this point, if only one move option has been added (i.e. the accusation move) then the user is trapped is has no other moves to make.
	// give them the option to end turn	
	if(playerMoveOptions.length == 1)
	{
		CreateMoveOptionAndPush(MoveEnum.EndTurn, 0, playerMoveOptions);
	}
		
	// notify all clients that player turn has changed
	io.sockets.emit('PlayerTurnChanged', { playerID : currentTurnPlayerID });
	
	// notify current player at turn of their move options
	playerSockets[currentTurnPlayerID].emit('MoveOptions', { moveOptions : playerMoveOptions });
	
	// wait for client response now to make a move
}

function CreateMoveOptionAndPush(mID, locID, options)
{
	var moveOption = { moveID : mID, locationID : locID };
	options.push(moveOption);
}

function GetPlayerLocation(pID)
{
	for(var index = 0; index < playerLocations.length; index++)
	{
		var playerLoc = playerLocations[index];
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
	for(var index = 0; index < playerLocations.length; index++)
	{
		var playerLoc = playerLocations[index];
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
			UpdatePlayerLocation(currentTurnPlayerID, moveData.LocationID);
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
	currentSuggestionCards = { playerID : suggPlayerID, weaponID : suggWeaponID, roomID : suggRoomID };
	currentProveTurnPlayerID = 0;
	
	// move the current player 
	UpdatePlayerLocation(currentTurnPlayerID, suggRoomID);
	
	io.sockets.emit("SuggestionMoveMade", 
	{ 
		playerMakingSuggestionID : currentTurnPlayerID,  
		playerID : suggPlayerID,
		weaponID : suggWeaponID,
		roomID : suggRoomID,
	});
	
	// move the suggested player to the suggested room
	var actuallyUpdated = UpdatePlayerLocation(suggPlayerID, suggRoomID);

	if (actuallyUpdated == true)
	{
	    playerDetailsDictionary[suggPlayerID].wasSuggestedAndMovedLastTurn = true;
	}

	//  we don't need to keep track of the weapon location on server side. just notify everyone its been moved
	io.sockets.emit("WeaponMoved", { weaponID : suggWeaponID, locationID : suggRoomID } );
		
	NextSuggestionProveTurn();
}

function NextSuggestionProveTurn()
{
	// ASSUMES ALL 6 PLAYERS ARE PARTICIPATING IN GAME	
	
	// if first starting suggestion prove turns, then go clockwise from the person 
	if(currentProveTurnPlayerID == 0)
	{
		currentProveTurnPlayerID = (currentTurnPlayerID % 6) + 1;
	}
	else
	{
		// otherwise, just get next prove turn player
		currentProveTurnPlayerID = (currentProveTurnPlayerID % 6) + 1;
	}
	
	// if we've circled back around to the current player, provide them with abililty to accuse or end turn
	if(currentProveTurnPlayerID == currentTurnPlayerID)
	{
		SendCurrentPlayerAccuseAndEndTurnMove();
	}
	else
	{
		// notify all that current prove turn player has changed
		io.sockets.emit('SuggestionProveTurnChanged', { playerID : currentProveTurnPlayerID } );
		
		// provide client with prove options
		var cardOptions = [];
		var suggestionTurnPlayerDetail = playerDetailsDictionary[currentProveTurnPlayerID];	
		
		for(var index = 0; index < suggestionTurnPlayerDetail.dealtCards.length; index++)
		{
			var cardID = suggestionTurnPlayerDetail.dealtCards[index];
			
			// player has one of the cards suggested to prove the suggestion wrong
			if (cardID == currentSuggestionCards.roomID ||
				cardID == (currentSuggestionCards.playerID + CONST_PLAYER_CARD_ENUM_OFFSET) ||  // Have to do offsets here to get the card enums to match against the PLAYER/WEAPON enums
				cardID == (currentSuggestionCards.weaponID + CONST_WEAPON_CARD_ENUM_OFFSET))
			{
				cardOptions.push(cardID);
			}
		}
		
		console.log("Prove Options:");
		console.log(cardOptions);
		// let single client know of their prove options
		playerSockets[currentProveTurnPlayerID].emit('SuggestionProveOptions', { dummyVal : 0, cardsPlayerCanSelect : cardOptions } );	
	}
	
}

function SendCurrentPlayerAccuseAndEndTurnMove()
{
	var playerMoveOptions = [];
	
	CreateMoveOptionAndPush(MoveEnum.MakeAnAccusation, 0, playerMoveOptions);
	CreateMoveOptionAndPush(MoveEnum.EndTurn, 0, playerMoveOptions);
	
	// notify current player at turn of their move options
	playerSockets[currentTurnPlayerID].emit('MoveOptions', { moveOptions : playerMoveOptions });
	
	// wait for response
}

function SuggestionProofResponseSent(data)
{
	// player debunked the suggestion.  
	if(data.CardID > 0)
	{
		// notify player at turn of the card that debunks the suggestion
		playerSockets[currentTurnPlayerID].emit('SuggestionDebunk', { playerID : currentProveTurnPlayerID, cardID : data.CardID });
		
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
	
	if(caseFile.roomID == accRoomID 
		&& caseFile.playerID == accPlayerID 
		&& caseFile.weaponID == accWeaponID)
	{
		isAccCorrect = true;
	}
	console.log("isAccCorrect: " + isAccCorrect);
	
	// let everyone know what the accusation was and whether it was correct or not.
	io.sockets.emit('AccusationMoveMade', 
		{ 
			playerThatMadeAccusation : currentTurnPlayerID,  
			playerID : accPlayerID,
			weaponID : accWeaponID,
			roomID : accRoomID,
			isCorrect : isAccCorrect
		}
	);
	
	// let player that made accusation know what the actual result was
	playerSockets[currentTurnPlayerID].emit('AccusationResult', 
	{
		playerID : caseFile.playerID,
		weaponID : caseFile.weaponID,
		roomID : caseFile.roomID
	});
	
	if(isAccCorrect == false)
	{
		var playerDetail = playerDetailsDictionary[currentTurnPlayerID];
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
		playerLocations.push({ playerID : pID, locationID: locID });
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
