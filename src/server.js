'use strict';

var express = require('express');
var mongoose = require('mongoose');
var PaperDoll = require('./../models/paperdoll');
var Token = require('./../models/token');
var rest = require('restling');
var bodyParser = require('body-parser');
var randomHex = require('random-hex');

var apiURL = 'http://localhost:3001';

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Connected');
});

var app = express();

app.use(bodyParser.json())

app.get('/rest/tokens/:id', function(req, res) {
  Token.findById(mongoose.Types.ObjectId(req.params.id), function (err, token) {
    if (err) console.log(err);
    res.send(token);
  });
});

app.put('/rest/tokens/:id', function(req, res) {
  try {
    var tokenId = mongoose.Types.ObjectId(req.params.id);
    Token.findById(tokenId, function (err, token) {
      token.isActive = true;
      token.save(function(err) {
        res.send(token);
      });
    });
  }
  catch (ex) {
    res.status(500).send("Error");
  }
});

app.post('/rest/tokens', function(req, res) {
  var existingToken = req.body.token;
  console.log('existingToken', existingToken);
  Token.findById(mongoose.Types.ObjectId(existingToken), function(err, token) {
    if (token !== undefined && token !== null && token.isActive) {
      token.isActive = false;
      token.save(function(err) {
        var newToken = new Token({ isActive: true });
        newToken.save(function (err) {
          if (err) console.log(err);
          res.send(newToken);
        })
      });
    }
    else {
      res.status(500).send('No active token with that id exists');
    }
  })
});


app.get('/rest/paperdolls', function(req, res) {
  PaperDoll.find(function (err, paperDolls) {
    res.send(paperDolls);
  });
});

app.post('/rest/paperdolls', function(req, res) {
  var name = req.body.name;
  var message = req.body.message;
  var tokenReceived = req.body.tokenReceived;
  var tokenSent = req.body.tokenSent;

  var paperDoll = new PaperDoll({
    name: name,
    message: message,
    tokenReceived: tokenReceived,
    tokenSent: tokenSent,
    color: randomHex.generate()
  });

  paperDoll.save(function (err, paperDoll) {
    res.send(paperDoll);
  });
});

var port = process.env.PORT || 3001;

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

function init() {

}
