'use strict';

var express = require('express');
var rest = require('restling');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var apiURL = 'http://localhost:3001';
var app = express();
app.use('/images', express.static('images'));

app.use(bodyParser());

/*
 Creates new paper doll, creates new active token, disables previous active token
 Requires:
 - req.body.token: Sent token (should be active)
 - req.body.name: Name
 - req.body.message: message
 */
app.post('/submit', function (req, res) {
  console.log("TOKEN TOKEN", req.body);
  rest.postJson(apiURL + '/rest/tokens', {
    token: req.body.token
  }).then(function(response) {
    rest.postJson(apiURL + '/rest/paperdolls', {
      name: req.body.name,
      message: req.body.message,
      tokenReceived: req.body.token,
      tokenSent: response.data._id
    }).then(function(response) {
      res.send("<a href='http://localhost:3000/" + response.data.tokenSent + "'>Next</a>");
    })
  }, function(err) {
    console.log(err);
  })
});

/*
 Returns whether or not token is active
 Requires:
 - req.params.id: token id
 */
app.get('/:id', function (req, res) {
  var svg;
  var svgOriginal = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="125px" height="192px" viewBox="0 0 125 192" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><title>Untitled</title><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><path d="M44.8165122,53.8325897 C37.0761508,48.5152852 32,39.6004419 32,29.5 C32,13.2075999 45.2075999,0 61.5,0 C77.7924001,0 91,13.2075999 91,29.5 C91,39.0371206 86.4742733,47.5172012 79.4532932,52.9097684 L124.738281,85.2226562 L124.738281,112.3125 L84.1914062,99.5859375 L123.988281,190.851562 L94.34375,190.851562 L62.6367787,149.671214 L62.6367188,149.710938 L30.6445312,191.261719 L1,191.261719 L40.796875,99.9960938 L0.25,112.722656 L0.25,85.6328125 L44.8165122,53.8325897 Z" id="Oval-1" fill="{{replaceme}}" sketch:type="MSShapeGroup"></path></g></svg>';
  rest.get(apiURL + '/rest/paperdolls').then(function(paperdollsResponse) {
    var response = '';
    response += '<div class="dolls" style="position: absolute; top: 0; left: 0">';
    paperdollsResponse.data.reverse();
    paperdollsResponse.data.forEach(function(doll) {
      svg = svgOriginal.split("{{replaceme}}").join(doll.color || '#f0f0f0');
      response += "<div style='display:inline-block; width:150px'><div style='display: block'><img src='data:image/svg+xml;utf8," + svg + "' style='width:150px'></img></div><div style='width:150px; text-align: center'>" + doll.name + "</div></div>";
    });
    response += '</div>';
    response += '<div class="form" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000">';
    response += "<h1>There are " + paperdollsResponse.data.length + " paper dolls in this chain.</h1>";

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {

      rest.get(apiURL + '/rest/tokens/' + req.params.id).then(function(tokensResponse) {
        if (tokensResponse.data.isActive) {
          response += "<h1>Add your name to the chain</h1>" +
            "<form method='post' action='http://localhost:3000/submit'>" +
              "<input type='text' name='name'></input>" +
              "<input type='text' name='message'></input>" +
              "<input type='hidden' name='token' value='" + req.params.id + "'></input>" +
              "<input type='submit' value='submit'></input>" +
            "</form>";
        }
        response += '</div>';
        res.send('<div style="z-index: 9999">' + response + '</div>');
      });
    }
    else {
      response += "<h1>It's not your turn yet. [Explain the idea]. [Explain what can be done in the meantime.]</h1>";
      res.send(response);
    }
  })
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

function init() {

}
