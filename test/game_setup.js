var expect = require('chai').expect
  , server = require('../app.js')
  , io = require('../node_modules/socket.io-client')
  , ioOptions = {
      transports: ['websocket']
    , forceNew: true
    , reconnection: false
  }
  , addr = 'http://localhost:3000/'



// DONE
// Six Players Can join the game
// The player list is broadcasted

// TODO
// Additional Players cannot join the game


describe('Game Setup', function(){

  // setup
  beforeEach(function(done){
    // start the io server
    server.listen(addr)

    // connect io clients
    player1 = io(addr, ioOptions)
    player2 = io(addr, ioOptions)
    player3 = io(addr, ioOptions)
    player4 = io(addr, ioOptions)
    player5 = io(addr, ioOptions)
    player6 = io(addr, ioOptions)
    player7 = io(addr, ioOptions)

    // finish setup
    done()
  });

  // cleanup
  afterEach(function(done){
    // disconnect io clients after each test
    player1.disconnect()
    player2.disconnect()
    player3.disconnect()
    player4.disconnect()
    player5.disconnect()
    player6.disconnect()
    player7.disconnect()
    done()
  });


  describe('After player 1 joins.', function(done){

    it('player 1 receives correct PlayerAssignedID message & PlayersInGameChanged message.', function(done){
      player1.emit('joinGame');
      player1.on('PlayerAssignedID', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerID":"1"}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player1.on('PlayersInGameChanged', function(msg){
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
        done()
      });
    });
  });


  describe('After player 2 joins.', function(done){
    it('player 2 receives correct PlayerAssignedID message & all get PlayersInGameChanged message.', function(done){
      player2.emit('joinGame');
      player2.on('PlayerAssignedID', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerID":"2"}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player1.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player2.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
        done()
      });
    });
  });


  describe('After player 3 joins.', function(done){
    it('player 3 receives correct PlayerAssignedID message & all get PlayersInGameChanged message.', function(done){
      player3.emit('joinGame');
      player3.on('PlayerAssignedID', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerID":"3"}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player1.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player2.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player3.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
        done()
      });
    });
  });


  describe('After player 4 joins.', function(done){
    it('player 4 receives correct PlayerAssignedID message & all get PlayersInGameChanged message.', function(done){
      player4.emit('joinGame');
      player4.on('PlayerAssignedID', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerID":"4"}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player1.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player2.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player3.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
      });

      player4.on('PlayersInGameChanged', function(msg){
        // console.log(msg)
        expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4"]}')
        expect(JSON.stringify(msg)).to.not.equal('blah')
        done()
      });
    });
  });


    describe('After player 5 joins.', function(done){
      it('player 5 receives correct PlayerAssignedID message & all get PlayersInGameChanged message.', function(done){
        player5.emit('joinGame');
        player5.on('PlayerAssignedID', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerID":"5"}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player1.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player2.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player3.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player4.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player5.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
          done()
        });
      });
    });


    describe('After player 6 joins.', function(done){
      it('player 6 receives correct PlayerAssignedID message & all get PlayersInGameChanged message.', function(done){
        player6.emit('joinGame');
        player6.on('PlayerAssignedID', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerID":"6"}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player1.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5","6"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player2.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5","6"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player3.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5","6"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player4.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5","6"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player5.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5","6"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
        });

        player6.on('PlayersInGameChanged', function(msg){
          // console.log(msg)
          expect(JSON.stringify(msg)).to.equal('{"playerIDs":["1","2","3","4","5","6"]}')
          expect(JSON.stringify(msg)).to.not.equal('blah')
          done()
        });
      });
    });

    describe('After player 7 tries to join.', function(done){
      it('PlayersInGameChanged message remains unchanged.', function(done){
        player7.emit('joinGame');
        done()
      });
    });

});
