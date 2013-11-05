
module.exports = function(mongoose) {
  'use strict';
  var model = require('./models/ref')(mongoose);

  return {
    ref: model
  };
};
