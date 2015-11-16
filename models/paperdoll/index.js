// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paperDollSchema = mongoose.Schema({
  'id': {type: Schema.ObjectId, index: true},
  'name': String,
  'message': String,
  'tokenReceived': String,
  'tokenSent': String,
  'country': String,
  'emailReceived': String,
  'emailSent': String,
  'color': String,
  'created': {
      type: Date,
      default: Date.now
  }
});

// the schema is useless so far
// we need to create a model using it
var PaperDoll = mongoose.model('PaperDoll', paperDollSchema);

// make this available to our users in our Node applications
module.exports = PaperDoll;
