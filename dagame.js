// Main Node File
// Data Access Object.  TODO: Refactor fields into functions to simulate pushing/pulling data

var enums = require('./enum.js');

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
playerDetailsDictionary[enums.PlayerEnum.Scarlet].defaultStartLocation = enums.LocEnum.HallLounge; 
playerDetailsDictionary[enums.PlayerEnum.Mustard].defaultStartLocation = enums.LocEnum.LoungeDin; 
playerDetailsDictionary[enums.PlayerEnum.Orchid].defaultStartLocation = enums.LocEnum.BallKitch; 
playerDetailsDictionary[enums.PlayerEnum.Green].defaultStartLocation = enums.LocEnum.ConBall; 
playerDetailsDictionary[enums.PlayerEnum.Peacock].defaultStartLocation = enums.LocEnum.LibCon; 
playerDetailsDictionary[enums.PlayerEnum.Plum].defaultStartLocation = enums.LocEnum.StudyLib; 

// Initialize all the Location Detail Information and Setup Their Edges 
var locationDetailsDictionary = {};
locationDetailsDictionary[enums.LocEnum.Study] = 
{
	edges : [enums.LocEnum.Kitchen, enums.LocEnum.StudyHall, enums.LocEnum.StudyLib],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.Hall] = 
{
	edges : [enums.LocEnum.StudyHall, enums.LocEnum.HallLounge, enums.LocEnum.HallBill],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.Lounge] = 
{
	edges : [enums.LocEnum.Conservatory, enums.LocEnum.HallLounge, enums.LocEnum.LoungeDin],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.Library] = 
{
	edges : [enums.LocEnum.StudyLib, enums.LocEnum.LibBill, enums.LocEnum.LibCon],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.BilliardRoom] = 
{
	edges : [enums.LocEnum.LibBill, enums.LocEnum.HallBill, enums.LocEnum.BillDin, enums.LocEnum.BillBall],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.DiningRoom] = 
{
	edges : [enums.LocEnum.LoungeDin, enums.LocEnum.BillDin, enums.LocEnum.DinKitch],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.Conservatory] = 
{
	edges : [enums.LocEnum.Lounge, enums.LocEnum.LibCon, enums.LocEnum.ConBall],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.Ballroom] = 
{
	edges : [enums.LocEnum.ConBall, enums.LocEnum.BillBall, enums.LocEnum.BallKitch],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.Kitchen] = 
{
	edges : [enums.LocEnum.Study, enums.LocEnum.BallKitch, enums.LocEnum.DinKitch],
	isRoom : true
};

locationDetailsDictionary[enums.LocEnum.StudyHall] = 
{
	edges : [enums.LocEnum.Study, enums.LocEnum.Hall],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.HallLounge] = 
{
	edges : [enums.LocEnum.Hall, enums.LocEnum.Lounge],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.StudyLib] = 
{
	edges : [enums.LocEnum.Study, enums.LocEnum.Library],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.HallBill] = 
{
	edges : [enums.LocEnum.Hall, enums.LocEnum.BilliardRoom],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.LoungeDin] = 
{
	edges : [enums.LocEnum.Lounge, enums.LocEnum.DiningRoom],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.LibBill] = 
{
	edges : [enums.LocEnum.Library, enums.LocEnum.BilliardRoom],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.BillDin] = 
{
	edges : [enums.LocEnum.BilliardRoom, enums.LocEnum.DiningRoom],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.LibCon] = 
{
	edges : [enums.LocEnum.Library, enums.LocEnum.Conservatory],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.BillBall] = 
{
	edges : [enums.LocEnum.BilliardRoom, enums.LocEnum.Ballroom],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.DinKitch] = 
{
	
	edges : [enums.LocEnum.DiningRoom, enums.LocEnum.Kitchen],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.ConBall] = 
{
	edges : [enums.LocEnum.Conservatory, enums.LocEnum.Ballroom],
	isRoom : false
};

locationDetailsDictionary[enums.LocEnum.BallKitch] = 
{
	edges : [enums.LocEnum.Ballroom, enums.LocEnum.Kitchen],
	isRoom : false
};


// Declare gameplay variables that are stored in memory.  "Our DAO layer"
var playerLocations = []; // Will Store an Array of {PlayerID, LocationID} objects
var caseFile; // should contain a playerID, weaponID, and roomID
var currentTurnPlayerID = 0; 
var currentProveTurnPlayerID = 0;  
var currentSuggestionCards;
var gameStarted = false;

function internalGetLocationDetail(locID)
{
	return locationDetailsDictionary[locID];
}

exports.playerDetails = playerDetailsDictionary;
exports.getLocationDetail = internalGetLocationDetail;
exports.playerLocations = playerLocations;
exports.caseFile = caseFile;
exports.currentTurnPlayerID = currentTurnPlayerID;
exports.currentProveTurnPlayerID = currentProveTurnPlayerID;
exports.currentSuggestionCards = currentSuggestionCards;
exports.gameStarted = gameStarted;