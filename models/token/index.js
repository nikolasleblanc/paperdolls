// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = mongoose.Schema({
  'id': {type: Schema.ObjectId, index: true},
  'isActive': Boolean,
  'used': Date
});

tokenSchema.statics.isActive = function (id) {
  this.findById(id, function(err, token) {
    return token.isActive
  });
};

// the schema is useless so far
// we need to create a model using it
var Token = mongoose.model('Token', tokenSchema);

// make this available to our users in our Node applications
module.exports = Token;
