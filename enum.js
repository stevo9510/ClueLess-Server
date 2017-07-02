// Main Node File
// Clueless Game Server

// DECLARE ENUMS 
var PlayerEnum = 
{
	Scarlet : 1,
	Mustard : 2,
	Orchid : 3,
	Green : 4,
	Peacock : 5,
	Plum : 6
}

var LocEnum =
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

var MoveEnum =
{
	MoveToHallway : 1,
	TakeSecretPassageAndSuggest : 2,
	MoveToRoomAndSuggest : 3, 
	StayInRoomAndSuggest : 4,
	MakeAnAccusation : 5,
	EndTurn : 6
}

exports.PlayerEnum = PlayerEnum
exports.MoveEnum = MoveEnum
exports.LocEnum = LocEnum
