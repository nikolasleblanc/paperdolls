'use strict';

var express = require('express');
var mongoose = require('mongoose');
var PaperDoll = require('./../models/paperdoll');
var Token = require('./../models/token');
var rest = require('restling');
var bodyParser = require('body-parser');
var randomHex = require('random-hex');

var nodemailer = require('nodemailer');
//var mandrillTransport = require('nodemailer-mandrill-transport');
var smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
    host: 'smtp.mandrillapp.com',
    port: 587,
    auth: {
        user: 'nikolas.leblanc@gmail.com',
        pass: process.env.PD_MANDRILL_KEY
    }
}));

/*
var transport = nodemailer.createTransport(mandrillTransport({
  auth: {
    apiKey: process.env.PD_MANDRILL_KEY
  }
}));
*/

mongoose.connect('mongodb://localhost/paperdolls');

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
  var country = req.body.country;
  var emailReceived = req.body.emailReceived;
  var emailSent = req.body.emailSent;

  var paperDoll = new PaperDoll({
    name: name,
    message: message,
    tokenReceived: tokenReceived,
    tokenSent: tokenSent,
    emailReceived: emailReceived,
    emailSent: emailSent,
    country: country,
    color: randomHex.generate()
  });

  paperDoll.save(function (err, paperDoll) {
    transport.sendMail({
      from: emailReceived,
      to: emailSent,
      subject: 'Please add your name to the chain',
      html: '<p>Show your support for a world of tolerance and not terror by following this link:<br/><a href="' + process.env.PD_SERVER_URL + '/' + tokenSent + '">' + process.env.PD_SERVER_URL + '/' + tokenSent + '</a></p>'
    }, function(err, info) {
      if (err) {
        console.log("error", err);
      } else {
        console.log("Email sent", info);
        res.send(paperDoll);
      }
    });
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
