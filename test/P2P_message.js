'use strict'

var expect = require('chai').expect
  , server = require('../app.js')
  , io = require('../node_modules/socket.io-client')
  , ioOptions = {
      transports: ['websocket']
    , forceNew: true
    , reconnection: false
  }
  , testMsg = 'Hello World!'
  , sender
  , receiver

  , addr = 'http://localhost:3000/'



describe('Connect & P2P Message', function(){

  // setup
  beforeEach(function(done){
    // start the io server
    server.listen(addr)

    // connect two io clients
    sender = io(addr, ioOptions)
    receiver = io(addr, ioOptions)

    // finish setup
    done()
  });

  // cleanup
  afterEach(function(done){
    // disconnect io clients after each test
    sender.disconnect()
    receiver.disconnect()
    done()
  });


  describe('Message Events', function(){
    it('Client can send message to another client.', function(done){
      sender.emit('connection-test-message', testMsg)
      receiver.on('connection-test-message', function(msg){
        expect(msg).to.equal(testMsg)
        expect(msg).to.not.equal('blah')
        done()
      });
    });
  });
});
