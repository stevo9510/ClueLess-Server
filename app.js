// Main Node File
// Clueless Game Server

var express = require('express')
var app = express()

server = require('http').createServer(app),
port = process.env.PORT || 3000,
io = require('socket.io')(server);

var Scarlet = 1,
	Mustard = 2,
	Orchid = 3,
	Green = 4,
	Peacock = 5,
	Plum = 6;

var Study = 1,
    Hall = 2,
    Lounge = 3,
    Library = 4,
    BilliardRoom = 5,
    DiningRoom = 6,
    Conservatory = 7,
    Ballroom = 8,
    Kitchen = 9,
    StudyHall = 10,
    HallLounge = 11,
    StudyLib = 12, 
    HallBill = 13,
    LoungeDin = 14,
    LibBill = 15,
    BillDin = 16,
    LibCon = 17,
    BillBall = 18,
    DinKitch = 19,
    ConBall = 20,
    BallKitch = 21;

// Setup all the playerDetails 
// TODO: Move this elsewhere?
var playerDetailsDictionary = {}

for(index = 1; index <= 6; index++)
{
	playerDetailsDictionary[index] = 
	{
		playerID : index,
		dealtCards : [],
		isActive : false,
		isEliminated : false,
		wasSuggestedAndMovedLastTurn : false
	};
}
playerDetailsDictionary[Scarlet].defaultStartLocation = HallLounge; // HallLounge
playerDetailsDictionary[Mustard].defaultStartLocation = LoungeDin; // LoungeDin
playerDetailsDictionary[Orchid].defaultStartLocation = BallKitch; // BallKitch
playerDetailsDictionary[Green].defaultStartLocation = ConBall; // ConBall
playerDetailsDictionary[Peacock].defaultStartLocation = LibCon; // LibCon
playerDetailsDictionary[Plum].defaultStartLocation = StudyLib; // StudyLib

var locationDetailsDictionary = {};
locationDetailsDictionary[Study] = 
{
	locationID : Study,
	edges : [Kitchen, StudyHall, StudyLib],
	isRoom : true
};

locationDetailsDictionary[Hall] = 
{
	locationID : Hall,
	edges : [StudyHall, HallLounge, HallBill],
	isRoom : true
};

locationDetailsDictionary[Lounge] = 
{
	locationID : Lounge,
	edges : [Conservatory, HallLounge, LoungeDin],
	isRoom : true
};

locationDetailsDictionary[Library] = 
{
	locationID : Library,
	edges : [StudyLib, LibBill, LibCon],
	isRoom : true
};

locationDetailsDictionary[BilliardRoom] = 
{
	locationID : BilliardRoom,
	edges : [LibBill, HallBill, BillDin, BillBall],
	isRoom : true
};

locationDetailsDictionary[DiningRoom] = 
{
	locationID : DiningRoom,
	edges : [LoungeDin, BillDin, DinKitch],
	isRoom : true
};

locationDetailsDictionary[Conservatory] = 
{
	locationID : Conservatory,
	edges : [Lounge, LibCon, ConBall],
	isRoom : true
};

locationDetailsDictionary[Ballroom] = 
{
	locationID : Ballroom,
	edges : [ConBall, BillBall, BallKitch],
	isRoom : true
};

locationDetailsDictionary[Kitchen] = 
{
	locationID : Kitchen,
	edges : [Study, BallKitch, DinKitch],
	isRoom : true
};

locationDetailsDictionary[StudyHall] = 
{
	locationID : StudyHall,
	edges : [Study, Hall],
	isRoom : false
};

locationDetailsDictionary[HallLounge] = 
{
	locationID : HallLounge,
	edges : [Hall, Lounge],
	isRoom : false
};

locationDetailsDictionary[StudyLib] = 
{
	locationID : StudyLib,
	edges : [Study, Library],
	isRoom : false
};

locationDetailsDictionary[HallBill] = 
{
	locationID : HallBill,
	edges : [Hall, BilliardRoom],
	isRoom : false
};

locationDetailsDictionary[LoungeDin] = 
{
	locationID : LoungeDin,
	edges : [Lounge, DiningRoom],
	isRoom : false
};

locationDetailsDictionary[LibBill] = 
{
	locationID : LibBill,
	edges : [Library, BilliardRoom],
	isRoom : false
};

locationDetailsDictionary[BillDin] = 
{
	locationID : BillDin,
	edges : [BilliardRoom, DiningRoom],
	isRoom : false
};

locationDetailsDictionary[LibCon] = 
{
	locationID : LibCon,
	edges : [Library, Conservatory],
	isRoom : false
};

locationDetailsDictionary[BillBall] = 
{
	locationID : BillBall,
	edges : [BilliardRoom, Ballroom],
	isRoom : false
};

locationDetailsDictionary[DinKitch] = 
{
	locationID : DinKitch,
	edges : [DiningRoom, Kitchen],
	isRoom : false
};

locationDetailsDictionary[ConBall] = 
{
	locationID : ConBall,
	edges : [Conservatory, Ballroom],
	isRoom : false
};

locationDetailsDictionary[BallKitch] = 
{
	locationID : BallKitch,
	edges : [Ballroom, Kitchen],
	isRoom : false
};

var PlayerLocations = [];
var caseFile;
var CurrentTurnPlayerID;
var CurrentProveTurnPlayerID;
var CurrentSuggestionCards;
var PlayerSockets = {};

// Server Start
server.listen(port);
console.log('Server listening on port 3000.');


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
    console.log('sock id ' + socket.id);

  });


  // User Disproves Suggestion
  socket.on('disproveSuggestion', function(data) {
    console.log('');

  });


  // User Quits Game
  socket.on('quitGame', function(data) {
    console.log('');

  });

  // User Disconencts
  socket.on('disconnect', function(data) {
    console.log('A user disconencted.');
	

  });

});

function PlayerJoinedGame(socket)
{
	// log to server console
	console.log('socketID: ' + socket.id);
	var playerID = 0;
	Object.keys(playerDetailsDictionary).forEach(function(key) {
		if(playerDetailsDictionary[key].isActive == false && playerID == 0)
		{
			playerID = key;
		}
	});
	
	if(playerID > 0)
	{
		playerDetailsDictionary[playerID].isActive = true;
		PlayerSockets[playerID] = socket;
		socket.emit('PlayerAssignedID', { playerID: playerID } );
		var playersInGame = []
		Object.keys(playerDetailsDictionary).forEach(function(key) 
		{
			if(playerDetailsDictionary[key].isActive == true)
			{
				playersInGame.push(key);
			}
		});
		io.sockets.emit('PlayersInGameChanged', { playerIDs: playersInGame } );
		
		if(playersInGame.length)
		{
			StartGame();
		}
	}

}

function StartGame()
{
	// Shuffle Cards
	shuffledCards = ShuffleCards();
		
	for(var ind = 0; ind < shuffledCards.length; ind++)
	{
		var playerIdToDealCard = (ind % 6) + 1;
		playerDetailsDictionary[playerIdToDealCard].dealtCards.push(shuffledCards[ind]);
	}	
	
	console.log(caseFile);
	Object.keys(PlayerSockets).forEach(function(key) {
		console.log(playerDetailsDictionary[key].dealtCards);
		PlayerSockets[key].emit('CardsDealt', { cardIDs: playerDetailsDictionary[key].dealtCards });
	});
	
	CurrentTurnPlayerID = Scarlet;
	
}

function ShuffleCards()
{
	// declare rooms, characters, weapons array of enums
	var rooms = [1,2,3,4,5,6,7,8,9];
	var characters = [1,2,3,4,5,6];
	var weapons = [1,2,3,4,5,6];
	
	// shuffle them all 
	rooms = ShuffleArray(rooms);
	characters = ShuffleArray(weapons);
	weapons = ShuffleArray(characters);
	
	// choose case file cards from each (removing from the array via pop)
	caseFile = new Object();
	caseFile.roomID = rooms.pop();
	caseFile.playerID = characters.pop();
	caseFile.weaponID = weapons.pop();
	
	// create deck of cards array
	cards = [];
	
	// build deck of cards from remaining rooms, characters, weapons.  offset value by certain amount to make appropriate card enum 
	CopyFromArrayToAnother(rooms, cards, 0);
	CopyFromArrayToAnother(characters, cards, 9);
	CopyFromArrayToAnother(weapons, cards, 15)
	
	// one last re-shuffle
	cards = ShuffleArray(cards);
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
